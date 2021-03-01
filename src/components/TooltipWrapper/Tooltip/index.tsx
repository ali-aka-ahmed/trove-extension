import { LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { AxiosRes } from '../../../app/server';
import { Record } from '../../../app/server/notion';
import { HighlightParam, IPostRes, IPostsRes } from '../../../app/server/posts';
import ExtensionError from '../../../entities/ExtensionError';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import { toArray } from '../../../utils';
import { get } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Dropdown from './Dropdown';
import Edge from './helpers/Edge';
import Highlighter, { HighlightType } from './helpers/highlight/Highlighter';
import { getRangeFromTextRange, getTextRangeFromRange } from './helpers/highlight/textRange';
import { getOsKeyChar, isOsKeyPressed } from './helpers/os';
import Point from './helpers/Point';
import ListReducer, { ListReducerActionType } from './helpers/reducers/ListReducer';
import {
  getHoveredRect,
  isMouseBetweenRects,
  isSelectionInEditableElement,
  selectionExists
} from './helpers/selection';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 200;
const MINI_TOOLTIP_HEIGHT = 32;

interface TooltipProps {
  root: ShadowRoot;
}

export default function Tooltip(props: TooltipProps) {
  const [didInitialGetPosts, setDidInitialGetPosts] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExtensionOn, setIsExtensionOn] = useState(false);
  const [position, setPosition] = useState(new Point(0, 0));
  const [positionEdge, setPositionEdge] = useState(Edge.Bottom);

  const [dropdownClicked, setDropdownClicked] = useState(false);
  const [defaultPageLoading, setDefaultPageLoading] = useState(true);
  const [dropdownItem, setDropdownItem] = useState<Record | null>(null);

  // Id of Notion page to save highlight/page to
  const [posts, dispatch] = useReducer(ListReducer<Post>('id'), []);
  const [user, setUser] = useState<User | null>(null);

  const [isSelectionHovered, setIsSelectionHovered] = useState(false);
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null);
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  const [highlighter, setHighlighter] = useState(new Highlighter());
  const [isTempHighlightVisible, setIsTempHighlightVisible] = useState(false);
  const [tempHighlight, setTempHighlight] = useState<HighlightParam | null>(null);
  const [tempHighlightRange, setTempHighlightRange] = useState<Range | null>(null);

  // TODO: maybe assign this to a range state var
  const getTooltipRange = useCallback(
    (range?: Range) => {
      if (range) {
        return range;
      }

      if (tempHighlightRange) {
        return tempHighlightRange;
      }

      const selection = getSelection()!;
      if (selectionExists(selection)) {
        return selection.getRangeAt(0);
      }

      return null;
    },
    [tempHighlightRange],
  );

  /**
   * Position and display tooltip according to change in selection.
   */
  const positionTooltip = useCallback(
    (range?: Range) => {
      const tooltipRange = getTooltipRange(range);
      if (!tooltipRange) return;

      const rect = tooltipRange.getBoundingClientRect();
      const height = tooltip.current?.getBoundingClientRect().height || MINI_TOOLTIP_HEIGHT;
      if (rect.bottom + height > document.documentElement.clientHeight) {
        setPositionEdge(Edge.Top);
        setPosition(
          new Point(
            rect.left + window.scrollX,
            rect.top + window.scrollY - height - TOOLTIP_MARGIN,
          ),
        );
      } else {
        setPositionEdge(Edge.Bottom);
        setPosition(new Point(rect.left + window.scrollX, rect.bottom + window.scrollY));
      }
    },
    [tooltip, getTooltipRange],
  );

  const addPosts = (postsToAdd: Post | Post[], type: HighlightType) => {
    postsToAdd = toArray(postsToAdd);
    for (const post of postsToAdd) {
      highlighter.addHighlight(post, type);
    }

    // Add post(s) to list of posts
    dispatch({ type: ListReducerActionType.UpdateOrAdd, data: postsToAdd });
  };

  const removePosts = (postsToRemove: Post | Post[]) => {
    postsToRemove = toArray(postsToRemove);
    for (const post of postsToRemove) {
      if (!post.highlight) continue;
      highlighter.removeHighlight(post.highlight.id);
    }
    // Remove post(s) from list of posts
    dispatch({ type: ListReducerActionType.Remove, data: postsToRemove });
  };

  // TODO: Store temp highlight stuff inside highlighter
  const addTempHighlight = useCallback(() => {
    const selection = getSelection();
    if (selection?.toString()) {
      const range = selection.getRangeAt(0);
      const textRange = getTextRangeFromRange(range);
      setTempHighlight({
        textRange: textRange,
        url: window.location.href,
      });

      highlighter.addHighlightTemp(range, user?.color, HighlightType.Active);
      setIsTempHighlightVisible(true);

      // Recalculate range after adding highlight because range may have shifted. Handles case
      // where highlight starts from offset 0, which would otherwise cause previously calculated
      // range to collapse.
      const newRange = getRangeFromTextRange(textRange);
      setTempHighlightRange(newRange);

      selection.removeAllRanges();
    }
  }, [user]);

  const removeTempHighlight = useCallback(() => {
    highlighter.removeHighlightTemp();
    setTempHighlight(null);
    setTempHighlightRange(null);
    setIsTempHighlightVisible(false);
    setDropdownClicked(false);
  }, []);

  const resetTooltip = () => {
    removeTempHighlight();
    setTooltipRect(null);

    // Making the assumption that whenever we reset tooltip, we are also resetting selection
    setIsSelectionHovered(false);
    setSelectionRect(null);
  };

  useEffect(() => {
    ReactTooltip.rebuild();

    get(['notionDefaults', 'spaceId']).then((data) => {
      if (data.spaceId && data.notionDefaults && data.notionDefaults[data.spaceId]) {
        setDropdownItem(data.notionDefaults[data.spaceId]);
      }
      setDefaultPageLoading(false);
    });

    // Get user object
    get(['user', 'isAuthenticated', 'isExtensionOn', 'lastPageName']).then((data) => {
      setIsAuthenticated(data.isAuthenticated || false);
      setIsExtensionOn(data.isExtensionOn || false);
      if (!data.isAuthenticated || !data.isExtensionOn) return;

      // Set current user
      if (data.user) setUser(new User(data.user));
    });

    chrome.storage.onChanged.addListener((change) => {
      if (change.isExtensionOn !== undefined) {
        setIsExtensionOn(change.isExtensionOn.newValue || false);
      }

      if (change.isAuthenticated !== undefined) {
        setIsAuthenticated(change.isAuthenticated.newValue || false);
      }

      if (change.user !== undefined) {
        setUser(change.user.newValue || null);
      }
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated && isExtensionOn && !didInitialGetPosts) {
      const url = window.location.href;
      sendMessageToExtension({ type: MessageType.GetPosts, url })
        .then((res: IPostsRes) => {
          if (res.success) {
            setDidInitialGetPosts(true);
            const newPosts = res.posts!.map((p) => new Post(p));
            addPosts(newPosts, HighlightType.Default);
          }
        })
        .catch((e) => console.error('Errored while getting posts:', e));
    } else if ((!isAuthenticated || !isExtensionOn) && posts.length > 0) {
      removePosts(posts);
    }
  }, [didInitialGetPosts, isAuthenticated, isExtensionOn, posts]);

  const onScroll = useCallback(() => {
    setIsSelectionHovered(false);
    setTooltipRect(null);
    setSelectionRect(null);
  }, []);

  useEffect(() => {
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const onResize = useCallback(() => {
    positionTooltip();
  }, [positionTooltip]);

  useEffect(() => {
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [onResize]);

  const onSelectionChange = useCallback((e: Event) => {
    // Don't set isSelectionVisible to true here because we only want tooltip to appear after
    // user has finished dragging selection. We set this in positionTooltip instead.
    const selection = getSelection();
    if (!selectionExists(selection)) {
      setIsSelectionHovered(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [onSelectionChange]);

  const onMouseDownPage = useCallback((e: MouseEvent) => {
    // Do nothing if selection exists, let onSelectionChange take care of it
    if (selectionExists(getSelection())) {
      return;
    }

    // Do nothing if user clicks Trove tooltip
    const target = e.target as HTMLElement;
    if (target.id === 'TroveTooltipWrapper') {
      return;
    }

    // Remove temp highlight if it exists
    resetTooltip();
  }, []);

  useEffect(() => {
    if (isTempHighlightVisible || isSelectionHovered) {
      document.addEventListener('mousedown', onMouseDownPage);
    } else {
      document.removeEventListener('mousedown', onMouseDownPage);
    }

    return () => document.removeEventListener('mousedown', onMouseDownPage);
  }, [isTempHighlightVisible, isSelectionHovered, onMouseDownPage]);

  const onDocumentMouseUp = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === 'TroveTooltipWrapper') {
        return;
      }

      if ((e.target as HTMLElement).classList.contains('TroveTooltip__Dropdown')) {
        setDropdownClicked(false);
      }

      positionTooltip();
    },
    [positionTooltip],
  );

  useEffect(() => {
    document.addEventListener('mouseup', onDocumentMouseUp);
    return () => document.removeEventListener('mouseup', onDocumentMouseUp);
  }, [onDocumentMouseUp]);

  const onMouseMovePage = useCallback(
    (e: MouseEvent) => {
      // Don't show mini-tooltip when dragging selection or it will repeatedly disappear and appear
      // as cursor enters and leaves selection
      if (e.buttons === 1 || isSelectionInEditableElement() || tempHighlightRange) {
        return;
      }

      let rect;
      const selection = getSelection()!;
      if (
        isSelectionHovered &&
        !!selectionRect &&
        !!tooltipRect &&
        isMouseBetweenRects(e, selectionRect, tooltipRect)
      ) {
        // Do nothing
      } else if (
        selectionExists(selection) &&
        !!(rect = getHoveredRect(e, selection.getRangeAt(0).getClientRects()))
      ) {
        setIsSelectionHovered(true);
        setTooltipRect(tooltip.current!.getBoundingClientRect());
        setSelectionRect(rect);
      } else {
        setIsSelectionHovered(false);
        setTooltipRect(null);
        setSelectionRect(null);
      }
    },
    [tooltipRect, isSelectionHovered, selectionRect, tooltipRect],
  );

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMovePage);
    return () => document.removeEventListener('mousemove', onMouseMovePage);
  }, [onMouseMovePage]);

  const onSaveHighlight = useCallback(async (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!dropdownItem) return;
    ReactTooltip.hide();

    if (tempHighlight) {
      const postReq = {
        url: window.location.href,
        highlight: tempHighlight,
      };

      // Hide tooltip
      resetTooltip();
      // Show actual highlight when we get response from server
      await sendMessageToExtension({ type: MessageType.AddTextBlock, notionPageId: dropdownItem.id, notionText: tempHighlight?.textRange.text }).then((res: AxiosRes) => {
        if (res.success) {
          sendMessageToExtension({ type: MessageType.CreatePost, post: postReq }).then(
            (res: IPostRes) => {
              if (res.success && res.post) {
                removeTempHighlight();
                addPosts(new Post(res.post), HighlightType.Default);
              } else {
                // Show that highlighting failed
                console.error('Failed to create post:', res.message);
                throw new ExtensionError(res.message!, 'Error creating highlight, try again!');
              }
            },
          );
        }
      });
    }
  }, [dropdownItem, tempHighlight]);

  const onSavePage = useCallback(async () => {
    if (!dropdownItem) return;
    // Write page title hyperlinked with current URL to chosen Notion page
    const href = window.location.href;
    const title = document.title;
    sendMessageToExtension({ type: MessageType.AddTextBlock, notionPageId: dropdownItem.id, notionText: [[title, [['a', href]]]] })
  }, [dropdownItem]);

  const renderItem = (item: Record | null) => {
    if (!item) {
      return <span>Click to select a page</span>;
    }
    let icon;
    if (item.icon?.type === 'emoji')
      icon = <span className="TroveDropdown__Icon">{item.icon?.value}</span>;
    else if (item.icon?.type === 'url')
      icon = (
        <img
          src={chrome.extension.getURL('images/noIconNotion.png')}
          className="TroveDropdown__Icon"
        />
      );
    return (
      <span className="TroveDropdown__SelectedItem">
        <span className="TroveDropdown__ItemIconWrapper">
          {item.icon ? (
            icon
          ) : (
            <img
              src={chrome.extension.getURL('images/noIconNotion.png')}
              className="TroveDropdown__Icon"
            />
          )}
        </span>
        <span className="TroveDropdown__SelectedItemName">{item.name}</span>
      </span>
    );
  };

  const onKeyDownPage = useCallback(
    (e: KeyboardEvent) => {
      // Handle case where user logs out or turns ext off, but page isn't refreshed
      if (!isAuthenticated || !isExtensionOn) return;

      // Keyboard shortcuts
      if (isOsKeyPressed(e) && e.key === 'd') {
        e.preventDefault();
        const selection = getSelection()!;
        if (isTempHighlightVisible) {
          // Save current highlight
          onSaveHighlight();
        } else if (selectionExists(selection) && /\S/.test(selection.toString())) {
          // New post on current selection
          setIsSelectionHovered(false);
          addTempHighlight();
        } else if (!selectionExists(selection)) {
          // Save current page
          onSavePage();
        }
      } else if (
        e.key === 'Tab' &&
        (isSelectionHovered || isTempHighlightVisible) &&
        !dropdownClicked
      ) {
        // Open dropdown
        e.preventDefault();
        const selection = getSelection()!;
        if (selectionExists(selection) && /\S/.test(selection.toString())) {
          addTempHighlight();
        }

        setDropdownClicked(true);
      }
    },
    [
      dropdownClicked,
      isAuthenticated,
      isExtensionOn,
      isSelectionHovered,
      isTempHighlightVisible,
      addTempHighlight,
      onSaveHighlight,
      onSavePage
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDownPage);
    return () => document.removeEventListener('keydown', onKeyDownPage);
  }, [onKeyDownPage]);

  if (isSelectionHovered) {
    return (
      <div
        className={classNames('', {
          'TroveTooltip--position-above': positionEdge === Edge.Top,
          'TroveTooltip--position-below': positionEdge === Edge.Bottom,
        })}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
        ref={tooltip}
      >
        <div className="TroveHint__Wrapper">
          <p className="TroveHint__Content__PrimaryText">Highlight text</p>
          <p className="TroveHint__Content__SecondaryText">{`(${getOsKeyChar()}+d)`}</p>
        </div>
      </div>
    );
  }
  return isTempHighlightVisible ? (
    <>
      <div
        className={classNames('TroveTooltip', {
          'TroveTooltip--position-above': positionEdge === Edge.Top,
          'TroveTooltip--position-below': positionEdge === Edge.Bottom,
        })}
        style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
        data-tip={`
          <div class="TroveHint__Content">
            <p class="TroveHint__Content__PrimaryText">Save to Notion</p>
            <p class="TroveHint__Content__SecondaryText">(${getOsKeyChar()}+d)</p>
          </div>
        `}
        ref={tooltip}
      >
        <div className="TroveTooltip__Content">
          <div
            className="TroveContent__Text"
            onClick={onSaveHighlight}
            onMouseEnter={() => ReactTooltip.show(tooltip.current!)}
            onMouseLeave={() => ReactTooltip.hide(tooltip.current!)}
          >
            Save to
          </div>
          {dropdownClicked ? (
            <Dropdown setItem={setDropdownItem} setDropdownClicked={setDropdownClicked} />
          ) : (
            <div
              onMouseEnter={() => ReactTooltip.show(button.current!)}
              onMouseLeave={() => ReactTooltip.hide(button.current!)}
              data-tip={`
                <div class="TroveHint__Content">
                  <p class="TroveHint__Content__PrimaryText">Pick Notion page</p>
                  <p class="TroveHint__Content__SecondaryText">(Tab)</p>
                </div>
              `}
              className="TroveContent__Wrapper"
            >
              <button
                className="TroveContent__SaveTo"
                onClick={() => {
                  const selection = getSelection()!;
                  if (selectionExists(selection) && /\S/.test(selection.toString())) {
                    addTempHighlight();
                  }

                  setDropdownClicked(true);
                  ReactTooltip.hide();
                }}
                ref={button}
              >
                {defaultPageLoading ? (
                  <div>
                    <LoadingOutlined />
                  </div>
                ) : (
                  renderItem(dropdownItem)
                )}
                <div className="TroveButton__IconRight">▾</div>
              </button>
            </div>
          )}
        </div>
      </div>
      <ReactTooltip
        place="bottom"
        className="TroveTooltip__Hint"
        effect="solid"
        event={'mouseenter'}
        eventOff={'mouseleave'}
        arrowColor="transparent"
        html={true}
        overridePosition={(pos) => {
          let rect = tooltipRect;
          if (!rect && tooltip.current) {
            rect = tooltip.current.getBoundingClientRect();
            setTooltipRect(rect);
          }

          const left = rect?.left || pos.left;
          const top = (rect?.bottom || pos.top) + 10;
          return { left, top };
        }}
        disable={dropdownClicked}
      />
    </>
  ) : null;
}
