import { LoadingOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { v4 as uuid } from 'uuid';
import { AxiosRes } from '../../../app/server';
import { Record } from '../../../app/server/notion';
import { CreatePostsReqBody, IPostsRes } from '../../../app/server/posts';
import ExtensionError from '../../../entities/ExtensionError';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import { toArray } from '../../../utils';
import { get } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Dropdown from './Dropdown';
import Highlighter, {
  getIdFromAnyHighlightData,
  HighlightType,
  transformUnsavedHighlightDataToCreateHighlightRequestData,
  transformUnsavedHighlightDataToTextList,
  UnsavedHighlightData,
} from './helpers/highlight/Highlighter';
import { getTextRangeFromRange } from './helpers/highlight/textRange';
import { getOsKeyChar, isOsKeyPressed } from './helpers/os';
import ListReducer, { ListReducerActionType } from './helpers/reducers/ListReducer';
import {
  isMouseBetweenRects,
  isSelectionInEditableElement,
  selectionExists,
} from './helpers/selection';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 200;
const MINI_TOOLTIP_HEIGHT = 32;
const DELETE_BUTTON_DIAMETER = 20;

interface TooltipProps {
  root: ShadowRoot;
}

export default function Tooltip(props: TooltipProps) {
  const [didInitialGetPosts, setDidInitialGetPosts] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExtensionOn, setIsExtensionOn] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [numTempHighlights, setNumTempHighlights] = useState(0);
  // Is user currently saving page
  const [isSavingPage, setIsSavingPage] = useState(false);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  // const [isSelectionHovered, setIsSelectionHovered] = useState(false);

  const [hoveredHighlightRect, setHoveredHighlightRect] = useState<DOMRect | null>(null);
  const [deleteButtonRect, setDeleteButtonRect] = useState<DOMRect | null>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);

  const [dropdownClicked, setDropdownClicked] = useState(false);
  const [defaultPageLoading, setDefaultPageLoading] = useState(true);
  const [dropdownItem, setDropdownItem] = useState<Record | null>(null);

  const [posts, dispatchPosts] = useReducer(ListReducer<Post>('id'), []);
  const [user, setUser] = useState<User | null>(null);

  const [highlighter, setHighlighter] = useState(new Highlighter());
  const tooltip = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const save = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);

  const updateNumTempHighlights = () => {
    const newVal = highlighter.getAllUnsavedHighlights().length;
    setNumTempHighlights(newVal);
    return newVal;
  };

  useEffect(() => {
    const newVal = isSavingPage || numTempHighlights > 0;
    setShowTooltip(newVal);
  }, [isSavingPage, numTempHighlights]);

  /**
   * Handler for when mouse cursor enters a Trove mark element. A highlight can be composed of
   * multiple marks, which can each have multiple client rects.
   */
  const onMarkMouseEnter = useCallback(
    (e: MouseEvent, data: Post | UnsavedHighlightData, mark: HTMLElement) => {
      // Don't trigger mouseenter event if user is selecting text (left mouse button down)
      if (e.buttons === 1) return;
      const id = getIdFromAnyHighlightData(data);
      highlighter.modifyHighlight(id, HighlightType.Active);
      setHoveredHighlightRect(mark.getBoundingClientRect());
    },
    [highlighter],
  );

  const onMarkMouseLeave = useCallback(
    (data: Post | UnsavedHighlightData) => {
      const id = getIdFromAnyHighlightData(data);
      highlighter.modifyHighlight(id, HighlightType.Default);
      setHoveredHighlightRect(null);
    },
    [highlighter],
  );

  /**
   * Attach handlers to highlights. We don't need to return a cleanup function since we're using
   * the .onevent notation (as opposed to addEventListener) to add the listeners, which only
   * accepts one event at a time. We have to include posts as a dependency to add handler to new
   * posts on page.
   * TODO: don't refresh handlers on already existing highlights
   */
  useEffect(() => {
    highlighter.highlights.forEach((highlight, id) => {
      for (const mark of highlight.marks) {
        mark.onmouseenter = (e: MouseEvent) => onMarkMouseEnter(e, highlight.data, mark);
      }

      highlight.handlers.mouseleave = () => onMarkMouseLeave(highlight.data);
    });
  }, [highlighter.getAllUnsavedHighlights(), posts, onMarkMouseEnter]);

  const addPosts = (postsToAdd: Post | Post[], type: HighlightType) => {
    postsToAdd = toArray(postsToAdd);
    for (const post of postsToAdd) {
      highlighter.addHighlight(post, type);
    }

    // Add post(s) to list of posts
    dispatchPosts({ type: ListReducerActionType.UpdateOrAdd, data: postsToAdd });
  };

  const removePosts = (postsToRemove: Post | Post[]) => {
    postsToRemove = toArray(postsToRemove);
    for (const post of postsToRemove) {
      if (!post.highlight) continue;
      highlighter.removeHighlight(post.highlight.id);
      updateNumTempHighlights();
    }

    // Remove post(s) from list of posts
    dispatchPosts({ type: ListReducerActionType.Remove, data: postsToRemove });
  };

  const addTempHighlight = useCallback(() => {
    const selection = getSelection();
    if (selection?.toString()) {
      const id = uuid();
      const range = selection.getRangeAt(0);
      const textRange = getTextRangeFromRange(range);

      // Replace active highlight and then make this inactive so there are no active highlights
      highlighter.addHighlight({ id, textRange, color: user!.color }, HighlightType.Active);
      highlighter.modifyHighlight(id, HighlightType.Default);
      updateNumTempHighlights();
      selection.removeAllRanges();
    }
  }, [user]);

  useEffect(() => {
    ReactTooltip.rebuild();

    get(['notionDefaults', 'spaceId']).then((data) => {
      if (data.spaceId && data.notionDefaults && data.notionDefaults[data.spaceId]) {
        setDropdownItem(data.notionDefaults[data.spaceId]);
      }
      setDefaultPageLoading(false);
    });

    // Get user object
    get(['user', 'isAuthenticated', 'isExtensionOn']).then((data) => {
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

  useEffect(() => {
    if (isAuthenticated && isExtensionOn && didInitialGetPosts) {
      removePosts(posts);
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
    }
  }, [user]);

  // const onResize = useCallback(() => {
  //   positionTooltip();
  // }, [positionTooltip]);

  // useEffect(() => {
  //   window.addEventListener('resize', onResize);
  //   return () => window.removeEventListener('resize', onResize);
  // }, [onResize]);

  const onSelectionChange = useCallback((e: Event) => {
    // Don't set isSelectionVisible to true here because we only want tooltip to appear after
    // user has finished dragging selection. We set this in positionTooltip instead.
    const selection = getSelection();
    if (!selectionExists(selection)) {
      // setIsSelectionHovered(false);
      setIsSelectionVisible(false);
    } else {
      setIsSelectionVisible(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [onSelectionChange]);

  const onDocumentMouseUp = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === 'TroveTooltipWrapper') {
        return;
      }

      if ((e.target as HTMLElement).classList.contains('TroveTooltip__Dropdown')) {
        setDropdownClicked(false);
      }
    },
    [addTempHighlight],
  );

  useEffect(() => {
    document.addEventListener('mouseup', onDocumentMouseUp);
    return () => document.removeEventListener('mouseup', onDocumentMouseUp);
  }, [onDocumentMouseUp]);

  const onMouseMovePage = useCallback(
    (e: MouseEvent) => {
      // Don't show mini-tooltip when dragging selection or it will repeatedly disappear and appear
      // as cursor enters and leaves selection
      if (e.buttons === 1 || isSelectionInEditableElement()) {
        return;
      }

      if (
        !!hoveredHighlightRect &&
        !!deleteButtonRect &&
        !isMouseBetweenRects(e, hoveredHighlightRect, deleteButtonRect)
      ) {
        highlighter.getHighlight(highlighter.activeHighlightId)?.handlers.mouseleave(e);
      }
    },
    [hoveredHighlightRect, deleteButtonRect],
  );

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMovePage);
    return () => document.removeEventListener('mousemove', onMouseMovePage);
  }, [onMouseMovePage]);

  const onSaveHighlight = useCallback(
    async (e?: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (!dropdownItem) return;
      ReactTooltip.hide();

      const unsavedHighlights = highlighter.getAllUnsavedHighlights();
      if (unsavedHighlights.length > 0) {
        // Write highlight text to chosen Notion page
        const res = (await sendMessageToExtension({
          type: MessageType.AddTextToNotion,
          notionPageId: dropdownItem.id,
          notionTextChunks: transformUnsavedHighlightDataToTextList(unsavedHighlights),
        })) as AxiosRes;
        if (res.success) {
          const postsArgs: CreatePostsReqBody = {
            posts: transformUnsavedHighlightDataToCreateHighlightRequestData(unsavedHighlights).map(
              (highlight) => {
                return {
                  url: window.location.href,
                  highlight,
                };
              },
            ),
          };
          await sendMessageToExtension({
            type: MessageType.CreatePosts,
            posts: postsArgs,
          }).then((res: IPostsRes) => {
            if (res.success && res.posts) {
              // Show actual highlight when we get response from server
              highlighter.removeAllUnsavedHighlights();
              res.posts.map((p) => {
                addPosts(new Post(p), HighlightType.Default);
              });
              updateNumTempHighlights();
            } else {
              // Show that highlighting failed
              console.error('Failed to create post:', res.message);
              throw new ExtensionError(res.message!, 'Error creating highlight, try again!');
            }
          });
        }
      }
    },
    [dropdownItem],
  );

  const onSavePage = useCallback(async () => {
    if (!dropdownItem) return;
    // Write page title hyperlinked with current URL to chosen Notion page
    const href = window.location.href;
    const title = document.title;
    sendMessageToExtension({
      type: MessageType.AddTextToNotion,
      notionPageId: dropdownItem.id,
      // notionTextChunks: [[[title, [['a', href]] ]]],
      notionTextChunks: [[title, [['a', href]]]],
    });
  }, [dropdownItem]);

  const renderItem = (item: Record | null) => {
    if (!item) {
      return (
        <span className="TroveDropdown__SelectedItem">
          <span>Click to select a page</span>
          <div className="TroveContent__SaveTo__IconRight">
            <img
              src={chrome.extension.getURL('images/chevronDown.png')}
              className="Trove__ChevronIcon"
            />
          </div>
        </span>
      );
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
        <div className="TroveContent__SaveTo__IconRight">
          <img
            src={chrome.extension.getURL('images/chevronDown.png')}
            className="Trove__ChevronIcon"
          />
        </div>
      </span>
    );
  };

  const renderHighlightDeleteButton = () => {
    if (!!hoveredHighlightRect) {
      const width =
        document.documentElement.clientWidth ||
        window.innerWidth - (document.querySelector('html')?.offsetWidth || 0);
      const height =
        document.documentElement.clientHeight ||
        window.innerHeight - (document.querySelector('html')?.offsetHeight || 0);
      const x = -width + window.scrollX + hoveredHighlightRect.right + 5;
      const y = -height + window.scrollY + hoveredHighlightRect.top;
      return (
        <button
          className="TroveMark__DeleteButton"
          style={{ transform: `translate3d(${x}px, ${y}px, 0px)` }}
          onClick={() => {
            const highlight = highlighter.getHighlight(highlighter.activeHighlightId);
            if (highlight && !highlight.isTemporary) {
              // Remove from server
              sendMessageToExtension({
                type: MessageType.DeletePost,
                id: highlighter.activeHighlightId,
              });
            }

            highlighter.removeHighlight(highlighter.activeHighlightId);
            setHoveredHighlightRect(null);
          }}
          ref={deleteButton}
        ></button>
      );
    }

    return null;
  };

  useEffect(() => {
    if (!!hoveredHighlightRect && deleteButton.current) {
      setDeleteButtonRect(deleteButton.current.getBoundingClientRect());
    }
  }, [hoveredHighlightRect]);

  const renderButtonList = (type: 'savePage' | 'saveHighlights') => {
    let onSave = handleSavePage;
    let onCancel = handleCancelSavePage;
    if (type === 'saveHighlights') {
      onSave = handleSaveHighlights;
      onCancel = handleCancelSaveHighlights;
    }

    return (
      <div className="TroveContent__ButtonList">
        <button
          onMouseEnter={() => ReactTooltip.show(save.current!)}
          onMouseLeave={() => ReactTooltip.hide(save.current!)}
          data-tip={`
            <div class="TroveHint__Content">
              <p class="TroveHint__Content__PrimaryText">${getOsKeyChar()}+d</p>
            </div>
          `}
          ref={save}
          className="Trove__Button"
          onClick={onSave}
        >
          {saveLoading && (
            <div className="Trove__ButtonLoading">
              <LoadingOutlined />
            </div>
          )}
          Save
        </button>
        <button
          onMouseEnter={() => ReactTooltip.show(cancel.current!)}
          onMouseLeave={() => ReactTooltip.hide(cancel.current!)}
          data-tip={`
            <div class="TroveHint__Content">
              <p class="TroveHint__Content__PrimaryText">esc</p>
            </div>
          `}
          ref={cancel}
          className="Trove__Button--secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  };

  const renderText = (type: 'savePage' | 'saveHighlights') => {
    switch (type) {
      case 'saveHighlights': {
        return (
          <div className="TroveContent__Text">
            Send {numTempHighlights > 1 ? `${numTempHighlights} highlights` : 'highlight'} to Notion
          </div>
        );
      }
      case 'savePage': {
        return <div className="TroveContent__Text">Send page to Notion</div>;
      }
      default:
        return null;
    }
  };

  const onKeyDownPage = useCallback(
    (e: KeyboardEvent) => {
      // Handle case where user logs out or turns ext off, but page isn't refreshed
      if (!isAuthenticated || !isExtensionOn || dropdownClicked) return;
      // Keyboard shortcuts
      if (isOsKeyPressed(e) && e.key === 'd') {
        e.preventDefault();
        const selection = getSelection()!;
        if (selectionExists(selection) && /\S/.test(selection.toString())) {
          // New post on current selection
          addTempHighlight();
        } else if (highlighter.getAllUnsavedHighlights().length > 0) {
          // Save current highlight
          setSaveLoading(true);
          onSaveHighlight().then(() => {
            setSaveLoading(false);
            setIsSavingPage(false);
          });
        } else if (!selectionExists(selection) && !showTooltip) {
          // New save for current page
          setIsSavingPage(true);
        } else if (!selectionExists(selection) && showTooltip) {
          // Save current page
          setSaveLoading(true);
          onSavePage().then(() => {
            setIsSavingPage(false);
            setSaveLoading(false);
          });
        }
      } else if (
        e.key === 'Tab' &&
        // (isSelectionHovered || highlighter.getAllUnsavedHighlights().length > 0) &&
        // highlighter.getAllUnsavedHighlights().length > 0 &&
        !dropdownClicked &&
        showTooltip
      ) {
        // Open dropdown
        e.preventDefault();
        setDropdownClicked(true);
      } else if (e.key === 'Escape' && showTooltip) {
        highlighter.removeAllUnsavedHighlights();
        updateNumTempHighlights();
        setIsSavingPage(false);
        setSaveLoading(false);
      }
    },
    [
      dropdownClicked,
      highlighter,
      isAuthenticated,
      isExtensionOn,
      addTempHighlight,
      onSaveHighlight,
      onSavePage,
      showTooltip,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDownPage);
    return () => document.removeEventListener('keydown', onKeyDownPage);
  }, [onKeyDownPage, dropdownClicked]);

  const handleSaveHighlights = () => {
    setSaveLoading(true);
    onSaveHighlight().then(() => {
      setSaveLoading(false);
      setIsSavingPage(false);
    });
  };

  const handleSavePage = () => {
    setSaveLoading(true);
    onSavePage().then(() => {
      setIsSavingPage(false);
      setSaveLoading(false);
    });
  };

  const handleCancelSaveHighlights = () => {
    highlighter.removeAllUnsavedHighlights();
    updateNumTempHighlights();
    setSaveLoading(false);
  };

  const handleCancelSavePage = () => {
    setIsSavingPage(false);
    setSaveLoading(false);
  };

  if (!showTooltip && isSelectionVisible) {
    return (
      <>
        <div className="TroveTooltip" ref={tooltip} style={{ width: '155px', height: '38px' }}>
          <div className="TroveHint__Wrapper">
            <p className="TroveHint__Content__PrimaryText">Highlight text</p>
            <p className="TroveHint__Content__SecondaryText">{`(${getOsKeyChar()}+d)`}</p>
          </div>
        </div>
        {renderHighlightDeleteButton()}
      </>
    );
  }

  if (showTooltip) {
    return (
      <>
        <div className="TroveTooltip" ref={tooltip}>
          <div className="TroveTooltip__Content">
            {renderText(isSavingPage ? 'savePage' : 'saveHighlights')}
            {dropdownClicked ? (
              <Dropdown
                setItem={setDropdownItem}
                setDropdownClicked={setDropdownClicked}
                root={props.root}
              />
            ) : (
              <div className="TroveTooltip__DropdownClosed">
                <div
                  onMouseEnter={() => ReactTooltip.show(button.current!)}
                  onMouseLeave={() => ReactTooltip.hide(button.current!)}
                  data-tip={`
                    <div class="TroveHint__Content">
                      <p class="TroveHint__Content__PrimaryText">tab</p>
                    </div>
                  `}
                  className="TroveContent__SaveTo"
                >
                  <button
                    className="TroveContent__SaveTo__Button"
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
                  </button>
                </div>
                {renderButtonList(isSavingPage ? 'savePage' : 'saveHighlights')}
              </div>
            )}
          </div>
        </div>
        {renderHighlightDeleteButton()}
        <ReactTooltip
          place="top"
          className="TroveTooltip__Hint"
          effect="solid"
          event={'mouseenter'}
          eventOff={'mouseleave'}
          arrowColor="transparent"
          html={true}
          disable={dropdownClicked}
        />
      </>
    );
  }

  return renderHighlightDeleteButton();
}
