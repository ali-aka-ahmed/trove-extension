import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import _ from 'lodash';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { v4 as uuid } from 'uuid';
import { Record } from '../../../app/notionTypes';
import {
  AnyPropertyUpdateData,
  MultiSelectOptionPropertyUpdate,
  PropertyUpdate,
  SelectOptionPropertyUpdate,
} from '../../../app/notionTypes/dbUpdate';
import {
  MultiSelectProperty,
  SchemaPropertyType,
  SelectProperty,
} from '../../../app/notionTypes/schema';
import { AxiosRes } from '../../../app/server';
import { ISchemaRes } from '../../../app/server/notion';
import { CreatePostsReqBody, IPostsRes } from '../../../app/server/posts';
import { MINIMUM_REQUEST_TIME } from '../../../constants';
import ExtensionError from '../../../entities/ExtensionError';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import IUser from '../../../models/IUser';
import { toArray } from '../../../utils';
import { get, get1, updateItemInNotionStore } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Dropdown from './Dropdown';
import Highlighter, {
  getIdFromAnyHighlightData,
  HighlightType,
  transformLinkDataToTextList,
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
import Highlight from './Highlight';
import Link from './Link';
import Property from './Property';
import Title from './Title';

interface TooltipProps {
  root: ShadowRoot;
}

export default function Tooltip(props: TooltipProps) {
  const [didInitialGetPosts, setDidInitialGetPosts] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExtensionOn, setIsExtensionOn] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [showPropertiesLoadError, setShowPropertiesLoadError] = useState(false);
  const [isDBSupported, setIsDBSupported] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [numTempHighlights, setNumTempHighlights] = useState(0);
  const [linkShowing, setLinkShowing] = useState(true);
  // const [tempHighlights, setTempHighlights] = useState([]);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  // const [isSelectionHovered, setIsSelectionHovered] = useState(false);

  const [hoveredHighlightRect, setHoveredHighlightRect] = useState<DOMRect | null>(null);
  const [deleteButtonRect, setDeleteButtonRect] = useState<DOMRect | null>(null);
  const deleteButton = useRef<HTMLButtonElement>(null);

  const [dropdownClicked, setDropdownClicked] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [defaultPageLoading, setDefaultPageLoading] = useState(true);
  const [dropdownItem, setDropdownItem] = useState<Record | null>(null);

  const [posts, dispatchPosts] = useReducer(ListReducer<Post>('id'), []);
  const [user, setUser] = useState<User | null>(null);

  const [highlighter, setHighlighter] = useState(new Highlighter());
  const [propertyUpdates, setPropertyUpdates] = useState<{
    [propertyId: string]: { type: SchemaPropertyType; data: AnyPropertyUpdateData };
  }>({});
  const tooltip = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const save = useRef<HTMLButtonElement>(null);
  // const cancel = useRef<HTMLButtonElement>(null);
  const info = useRef<HTMLSpanElement>(null);

  const updateNumTempHighlights = () => {
    const newVal = highlighter.getAllUnsavedHighlights().length;
    setNumTempHighlights(newVal);
    return newVal;
  };

  const removeLink = () => {
    setLinkShowing(false);
    highlighter.removeLink();
  };

  useEffect(() => {
    if (!linkShowing && numTempHighlights === 0) {
      setShowTooltip(false);
      setPropertyUpdates({});
      highlighter.reset();
      setLinkShowing(true);
      setSaveLoading(false);
    }
  }, [numTempHighlights, linkShowing]);

  useEffect(() => {
    if (!propertiesLoading) scrollToElement('TroveBottomContent');
    else if (dropdownItem) scrollToElement('TroveBottomContent');
  }, [dropdownItem, propertiesLoading]);

  const setPropertyUpdate = (
    propertyId: string,
    type: SchemaPropertyType,
    data: AnyPropertyUpdateData,
  ) => {
    const newPropertyUpdates = { ...propertyUpdates };
    newPropertyUpdates[propertyId] = { type, data };
    setPropertyUpdates(newPropertyUpdates);
  };

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
    scrollToElement('TroveBottomContent');
  }, [user]);

  const scrollToElement = (id: string) => {
    const elem = props.root.getElementById(id);
    if (elem) elem.scrollIntoView();
  };

  useEffect(() => {
    ReactTooltip.rebuild();

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
        if (change.isAuthenticated.newValue === true) {
          setIsExtensionOn(true);
          get1('user').then((user: IUser) => {
            setUser(new User(user));
          });
        }
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
      if (!dropdownItem) return null;
      const unsavedHighlights = highlighter.getAllUnsavedHighlights();
      const link = highlighter.link;
      if (unsavedHighlights.length === 0 && !link.toSend) return null;
      ReactTooltip.hide();

      let res: AxiosRes;
      // Write highlight text to chosen Notion page
      if (dropdownItem.type !== 'database') {
        res = (await sendMessageToExtension({
          type: MessageType.AddTextToNotion,
          notionPageId: dropdownItem.id,
          notionTextChunks: transformLinkDataToTextList(link).concat(
            transformUnsavedHighlightDataToTextList(unsavedHighlights),
          ),
        })) as AxiosRes;
      } else {
        const updates: PropertyUpdate[] = [];
        for (let key in propertyUpdates) {
          const pu = { ...propertyUpdates[key], propertyId: key };
          updates.push(pu);
        }
        res = (await sendMessageToExtension({
          type: MessageType.AddNotionRow,
          dbId: dropdownItem.collectionId || dropdownItem.id,
          updates,
          notionTextChunks: transformLinkDataToTextList(link).concat(
            transformUnsavedHighlightDataToTextList(unsavedHighlights),
          ),
        })) as AxiosRes;
      }
      // Add to our own servers
      if (res.success) {
        setShowTooltip(false);
        setPropertyUpdates({});
        highlighter.reset();
        setLinkShowing(true);

        const postsArgs: CreatePostsReqBody = {
          posts: transformUnsavedHighlightDataToCreateHighlightRequestData(unsavedHighlights),
        };
        return await sendMessageToExtension({
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
      } else return res;
    },
    [dropdownItem, propertyUpdates],
  );

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
          src={chrome.extension.getURL('images/notion/no_page_icon.png')}
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
              src={chrome.extension.getURL('images/notion/no_page_icon.png')}
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

  const removeHighlight = (highlightId: string) => {
    const highlight = highlighter.getHighlight(highlightId);
    if (highlight && !highlight.isTemporary) {
      // Remove from server
      sendMessageToExtension({
        type: MessageType.DeletePost,
        id: highlight.data.id,
      });
    }

    highlighter.removeHighlight(highlightId);
    setHoveredHighlightRect(null);
    updateNumTempHighlights();
  };

  const renderHighlightDeleteButton = () => {
    if (!!hoveredHighlightRect) {
      let width =
        document.documentElement.clientWidth ||
        window.innerWidth - (document.querySelector('html')?.offsetWidth || 0);
      let height =
        document.documentElement.clientHeight ||
        window.innerHeight - (document.querySelector('html')?.offsetHeight || 0);
      if (height > window.innerHeight) height = window.innerHeight;
      if (width > window.innerWidth) width = window.innerWidth;
      const x = -width + window.scrollX + hoveredHighlightRect.right + 5;
      const y = -height + window.scrollY + hoveredHighlightRect.top;

      return (
        <button
          className="TroveMark__DeleteButton"
          style={{ transform: `translate3d(${x}px, ${y}px, 0px)` }}
          onClick={() => removeHighlight(highlighter.activeHighlightId)}
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

  const renderButtonList = () => {
    let onSave = () => {
      setSaveLoading(true);
      handleSaveHighlights();
    };
    let onCancel = handleCancelSaveHighlights;

    return (
      <div className="TroveContent__ButtonList" style={saveLoading ? { width: '156px' } : {}}>
        <button
          onMouseEnter={() => ReactTooltip.show(save.current!)}
          onMouseLeave={() => ReactTooltip.hide(save.current!)}
          data-tip={`
            <div class="TroveHint__Content">
              <p class="TroveHint__Content__PrimaryText">${getOsKeyChar()}+enter</p>
            </div>
          `}
          ref={save}
          className="Trove__Button"
          onClick={onSave}
          // onClick={() => sendMessageToExtension({ type: MessageType.Test })}
        >
          {saveLoading && (
            <div className="Trove__ButtonLoading">
              <LoadingOutlined />
            </div>
          )}
          Save
        </button>
        <button
          // onMouseEnter={() => ReactTooltip.show(cancel.current!)}
          // onMouseLeave={() => ReactTooltip.hide(cancel.current!)}
          // data-tip={`
          //   <div class="TroveHint__Content">
          //     <p class="TroveHint__Content__PrimaryText">esc</p>
          //   </div>
          // `}
          // ref={cancel}
          className="Trove__Button--secondary"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    );
  };

  const renderText = useCallback(() => {
    const highlights = highlighter.getAllUnsavedHighlights();
    const link = highlighter.link;
    return (
      <div className="TroveContent__Text">
        {linkShowing && (
          <Link
            link={link}
            root={props.root}
            modifyLinkContent={highlighter.modifyContent}
            removeLink={removeLink}
            scrollToElement={scrollToElement}
          />
        )}
        {highlights.map((h) => (
          <Highlight
            highlight={h}
            removeHighlight={removeHighlight}
            modifyHighlightContent={highlighter.modifyContent}
            scrollToElement={scrollToElement}
            root={props.root}
          />
        ))}
      </div>
    );
  }, [numTempHighlights, linkShowing]);

  useEffect(() => {
    setIsDBSupported(true);
    // if the default is a database, re-fetch properties in case they changed
    if (dropdownItem?.hasSchema) handleGetProperties();
  }, [dropdownItem]);

  const handleGetProperties = () => {
    if (!dropdownItem) return;
    setPropertiesLoading(true);
    sendMessageToExtension({
      type: MessageType.GetNotionDBSchema,
      dbId: dropdownItem.collectionId || dropdownItem.id,
    }).then((res: ISchemaRes) => {
      if (res.success) {
        setShowPropertiesLoadError(false);
        if (!res.isSupported) {
          setIsDBSupported(false);
          setPropertiesLoading(false);
        } else {
          // reset item for new properties to render
          const newSchema = res.schema;
          if (_.isEqual(newSchema, dropdownItem.schema)) {
            setPropertiesLoading(false);
            return;
          }
          dropdownItem.schema = newSchema;
          setDropdownItem(dropdownItem);
          setPropertiesLoading(false);
          // save adjusted defaultItem in the notionDefaults and notionRecents
          get1('spaceId').then((spaceId: string) => updateItemInNotionStore(spaceId, dropdownItem));
        }
      } else {
        setShowPropertiesLoadError(true);
        setPropertiesLoading(false);
      }
    });
  };

  const onKeyDownPage = useCallback(
    (e: KeyboardEvent) => {
      // Handle case where user logs out or turns ext off, but page isn't refreshed
      if (!isAuthenticated || !isExtensionOn || dropdownClicked) return;
      // Keyboard shortcuts
      if (isOsKeyPressed(e) && e.key === 'd') {
        e.preventDefault();
        const selection = getSelection()!;
        if (!showTooltip) {
          get(['notionDefaults', 'spaceId']).then((data) => {
            const spaceId = data.spaceId;
            if (spaceId && data.notionDefaults && data.notionDefaults[spaceId]) {
              const defaultItem: Record = data.notionDefaults[spaceId];
              setDropdownItem(defaultItem);
            }
            setDefaultPageLoading(false);
          });
          setShowTooltip(true);
        }
        if (selectionExists(selection) && /\S/.test(selection.toString())) {
          // New post on current selection
          addTempHighlight();
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
        e.stopPropagation();
        storePropertyValuesOnDropdownItem();
        setDropdownClicked(true);
        ReactTooltip.hide();
        // else if (e.key === 'Escape' && showTooltip) {
        //   e.preventDefault();
        //   handleCancelSaveHighlights();
        // }
      } else if (
        isOsKeyPressed(e) &&
        e.key === 'Enter' &&
        showTooltip &&
        !dropdownClicked &&
        !collapsed &&
        (highlighter.getAllUnsavedHighlights().length > 0 || highlighter.link.toSend)
      ) {
        e.preventDefault();
        // Save current highlight
        setSaveLoading(true);
        handleSaveHighlights();
      }
    },
    [
      collapsed,
      dropdownClicked,
      highlighter,
      isAuthenticated,
      isExtensionOn,
      addTempHighlight,
      onSaveHighlight,
      showTooltip,
    ],
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDownPage);
    return () => document.removeEventListener('keydown', onKeyDownPage);
  }, [onKeyDownPage]);

  const handleSaveHighlights = () => {
    setSaveLoading(true);
    onSaveHighlight().then((res) => {
      if (!res) {
        setSaveLoading(false);
        return;
      }
      if (res.time < MINIMUM_REQUEST_TIME) {
        setTimeout(() => {
          setSaveLoading(false);
        }, MINIMUM_REQUEST_TIME - res.time);
      } else {
        setSaveLoading(false);
      }
    });
  };

  const handleCancelSaveHighlights = () => {
    highlighter.removeAllUnsavedHighlights();
    updateNumTempHighlights();
    setLinkShowing(false);
  };

  const renderProperties = (item: Record | null) => {
    if (!item || !item.schema) return null;
    return (
      <div
        className="TroveTooltip__Properties"
        key={item.id}
        style={!dropdownItem?.hasSchema ? { marginTop: '15px' } : {}}
      >
        {item.schema.map((p) => (
          <Property property={p} root={props.root} updateProperty={setPropertyUpdate} />
        ))}
      </div>
    );
  };

  const collapse = (val: boolean) => {
    if (val) {
      setCollapsed(true);
    } else {
      storePropertyValuesOnDropdownItem();
      setCollapsed(false);
    }
  };

  const storePropertyValuesOnDropdownItem = () => {
    // take propertyUpdates and put then on dropdownItem.
    const newSchema = dropdownItem?.schema?.map((sv) => {
      const { propertyId } = sv;
      if (!propertyUpdates[propertyId]) return sv;
      const { type, data } = propertyUpdates[propertyId];
      if (type === SchemaPropertyType.Select) {
        sv.value = (data as SelectOptionPropertyUpdate).selected;
        (sv as SelectProperty).options = (sv as SelectProperty).options.concat(
          (data as SelectOptionPropertyUpdate).newOptions,
        );
      } else if (type === SchemaPropertyType.MultiSelect) {
        sv.value = (data as MultiSelectOptionPropertyUpdate).selected;
        (sv as MultiSelectProperty).options = (sv as MultiSelectProperty).options.concat(
          (data as MultiSelectOptionPropertyUpdate).newOptions,
        );
      } else {
        sv.value = data;
      }
      return sv;
    });
    // save title in dropdownItem
    if (propertyUpdates['title']) {
      newSchema?.push({
        name: 'Title',
        propertyId: 'title',
        type: SchemaPropertyType.Title,
        value: propertyUpdates['title'].data as string,
      });
    }
    if (dropdownItem) {
      dropdownItem.schema = newSchema;
      setDropdownItem(dropdownItem);
    }
  };

  const goToFeedback = () => {
    sendMessageToExtension({
      type: MessageType.OpenTab,
      url: 'https://www.notion.so/simplata/Trove-Community-Board-c2c9fe006c29404b967497ae2d2f3079',
      active: true,
    });
  };

  if (!showTooltip && isSelectionVisible) {
    return (
      <>
        <div className="TroveTooltip" ref={tooltip} style={{ width: '155px', height: '38px' }}>
          <div className="TroveHint__Wrapper">
            <p className="TroveHint__Content__PrimaryText" style={{ fontSize: '14px' }}>
              Highlight text
            </p>
            <p className="TroveHint__Content__SecondaryText" style={{ fontSize: '14px' }}>
              {`(${getOsKeyChar()}+d)`}
            </p>
          </div>
        </div>
        {renderHighlightDeleteButton()}
      </>
    );
  }

  const changeItem = (item: Record) => {
    if (item.id === dropdownItem?.id) return;
    else {
      setPropertyUpdates({});
      setDropdownItem(item);
    }
  };

  const getTitle = (item: Record | null) => {
    if (!item) return undefined;
    if (item.type !== 'database') return dropdownItem?.name;
    else if (item.schema?.find((sv) => sv.propertyId === 'title')) {
      return item.schema?.find((sv) => sv.propertyId === 'title')?.value as string;
    } else return undefined;
  };

  const getTitleEditable = (item: Record | null) => {
    if (!item) return false;
    if (item.type !== 'database') return false;
    else if (item.schema?.find((sv) => sv.propertyId === 'title')) {
      return true;
    } else return true;
  };

  if (showTooltip) {
    return (
      <>
        <div
          className="TroveTooltip"
          ref={tooltip}
          style={{
            maxWidth: `${window.innerWidth - 40}px`,
            maxHeight: `${window.innerHeight - 40}px`,
          }}
        >
          <div className="TroveTooltip__Content">
            {dropdownClicked ? (
              <>
                <Dropdown
                  setItem={changeItem}
                  setDropdownClicked={setDropdownClicked}
                  root={props.root}
                />
              </>
            ) : (
              <div className="TroveTooltip__DropdownClosed" id="TroveTooltip__DropdownClosed">
                {propertiesLoading && (
                  <div className="TroveTooltip__LoadingPropertiesWrapper">
                    <span className="TroveTooltip__LoadingPropertiesSymbol">
                      <LoadingOutlined />
                    </span>
                    <span className="TroveTooltip__LoadingPropertiesText">
                      Syncing properties...
                    </span>
                  </div>
                )}
                {showPropertiesLoadError && !propertiesLoading && (
                  <div className="TroveTooltip__LoadingPropertiesWrapper">
                    <span
                      className="TroveTooltip__LoadingPropertiesSymbol--failure"
                      ref={info}
                      onClick={handleGetProperties}
                    >
                      <ReloadOutlined />
                    </span>
                    <span className="TroveTooltip__LoadingPropertiesText">
                      Unable to get latest properties. Click the icon to try again.
                    </span>
                  </div>
                )}
                {isDBSupported && (
                  <Title
                    existingTitle={getTitle(dropdownItem)}
                    updateProperty={setPropertyUpdate}
                    setCollapsed={collapse}
                    collapsed={collapsed}
                    editable={getTitleEditable(dropdownItem)}
                  />
                )}
                {!collapsed && (
                  <>
                    {!isDBSupported ? (
                      <div className="TroveDBNotSupported">
                        <div className="TroveDBNotSupported__Title">
                          Database currently not supported
                        </div>
                        <div className="TroveDBNotSupported__SubTitle">
                          <span>Want this fixed?</span>
                          <span className="TroveDBNotSupported__LinkedText" onClick={goToFeedback}>
                            Let us know
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderProperties(dropdownItem)}
                        {(dropdownItem?.type === 'database' || dropdownItem?.hasSchema) && (
                          <div className="TroveTooltip__Divider" />
                        )}
                        {renderText()}
                      </>
                    )}
                    <div className="TroveTooltip__BottomContent" id="TroveBottomContent">
                      <button
                        className="TroveContent__SaveTo__Button"
                        onMouseEnter={() => ReactTooltip.show(button.current!)}
                        onMouseOver={() => ReactTooltip.show(button.current!)}
                        onMouseLeave={() => ReactTooltip.hide(button.current!)}
                        data-tip={`
                          <div class="TroveHint__Content">
                            <p class="TroveHint__Content__PrimaryText">tab</p>
                          </div>
                        `}
                        onClick={() => {
                          storePropertyValuesOnDropdownItem();
                          setDropdownClicked(true);
                          ReactTooltip.hide();
                        }}
                        ref={button}
                        style={saveLoading ? { width: '144px' } : {}}
                      >
                        {defaultPageLoading ? (
                          <div>
                            <LoadingOutlined />
                          </div>
                        ) : (
                          renderItem(dropdownItem)
                        )}
                      </button>
                      {renderButtonList()}
                    </div>
                  </>
                )}
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
