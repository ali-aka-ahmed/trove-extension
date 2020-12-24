import classNames from 'classnames';
import Color from 'color';
import { Delta, Sources } from 'quill';
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import ReactQuill, { UnprivilegedEditor } from 'react-quill';
import { v4 as uuid } from 'uuid';
import ExtensionError from '../../../entities/ExtensionError';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import ITopic from '../../../models/ITopic';
import { HighlightParam, IPostRes, IPostsRes } from '../../../server/posts';
import { toArray } from '../../../utils';
import { get } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Edge from './helpers/Edge';
import Highlighter, { HighlightType } from './helpers/highlight/Highlighter';
import { getRangeFromTextRange, getTextRangeFromRange } from './helpers/highlight/textRange';
import Point from './helpers/Point';
import ListReducer, { ListReducerActionType } from './helpers/reducers/ListReducer';
import InputPill from './inputPill';
import Pill from './pill';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 200;

interface TooltipProps {
  root: ShadowRoot;
}

export default function Tooltip(props: TooltipProps) {
  const [didInitialGetPosts, setDidInitialGetPosts] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  // const [hoveredHighlightPost, setHoveredHighlightPost] = useState<any | null>({"id":"fe2d5b09-07a9-423c-bea5-0d83c11aa31b","content":"","creationDatetime":1608718889207,"creator":{"id":"2d611faf-323e-49de-bedc-d3cf4254ed90","displayName":"Ali","username":"ali","creationDatetime":1607944594274,"color":"#EB144C"},"domain":"nytimes.com","url":"https://nytimes.com/2020/12/22/us/politics/trump-pardons.html","topics":[],"taggedUsers":[],"numComments":0,"numLikes":1,"liked":true,"highlight":{"id":"b638f067-f465-4ab7-becf-34c9d9d361a9","creationDatetime":1608718889208,"textRange":{"context":"inquiry, four Blackwater guards convicted in connection with the killing of Iraqi civilians and three corrupt former Republican members of Congress.\n\nIt was a remarkable assertion of pardon power","uniqueTextStartIdx":0,"contextStartIdx":65,"text":"killing of Iraqi civilians and three corrupt former Republican members of Congress","uniqueText":"killing of Iraqi civilians and three corrupt former Republican members of Congress"},"domain":"nytimes.com","type":0,"url":"https://nytimes.com/2020/12/22/us/politics/trump-pardons.html"}})
  const [hoveredHighlightPost, setHoveredHighlightPost] = useState<Post | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExtensionOn, setIsExtensionOn] = useState(false);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [isTempHighlightVisible, setIsTempHighlightVisible] = useState(false);
  const [position, setPosition] = useState(new Point(0, 0));
  const [positionEdge, setPositionEdge] = useState(Edge.Bottom);
  const [posts, dispatch] = useReducer(ListReducer<Post>('id'), []);
  const [tempHighlight, setTempHighlight] = useState<HighlightParam | null>(null);
  const [tempHighlightId, setTempHighlightId] = useState('');
  const [tempHighlightRange, setTempHighlightRange] = useState<Range | null>(null);
  const [topics, setTopics] = useState<Partial<ITopic>[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [highlighter, setHighlighter] = useState(new Highlighter());
  const quill = useRef<ReactQuill>(null!);

  /**
   * Position and display tooltip according to change in selection.
   */
  const positionTooltip = useCallback((e: Event, range?: Range) => {
    const selection = getSelection()!;
    let rect: DOMRect | null = null;
    if (range) {
      rect = range.getBoundingClientRect();
    } else if (tempHighlightRange) {
      rect = tempHighlightRange.getBoundingClientRect();
    } else if (selectionExists(selection)) {
      rect = selection.getRangeAt(0).getBoundingClientRect();
      setIsSelectionVisible(true);
    }

    if (!rect) return;
    if (rect.bottom + TOOLTIP_HEIGHT > document.documentElement.clientHeight) {
      setPositionEdge(Edge.Top);
      setPosition(new Point(
        rect.left + window.scrollX,
        rect.top + window.scrollY - TOOLTIP_HEIGHT - TOOLTIP_MARGIN
      ));
    } else {
      setPositionEdge(Edge.Bottom);
      setPosition(new Point(rect.left + window.scrollX, rect.bottom + window.scrollY));
    }
  }, [tempHighlightRange]);

  useEffect(() => {
    document.addEventListener('mouseup', positionTooltip);
    window.addEventListener('resize', positionTooltip);
    return () => {
      document.removeEventListener('mouseup', positionTooltip);
      window.removeEventListener('resize', positionTooltip);
    };
  }, [positionTooltip]);

  const onHighlightMouseEnter = useCallback((e: MouseEvent, post: Post) => {
    if (!post.highlight) return;

    let range: Range | null;
    try {
      range = getRangeFromTextRange(post.highlight.textRange);
    } catch (e) {
      range = null;
    }

    highlighter.modifyHighlightTemp(HighlightType.Default);
    highlighter.modifyHighlight(post.highlight.id, HighlightType.Active);
    positionTooltip(e, range ? range : undefined);
    setHoveredHighlightPost(post);
  }, [highlighter, positionTooltip]);

  const onHighlightMouseLeave = useCallback((e: MouseEvent, post: Post) => {
    if (!post.highlight) return;
    highlighter.modifyHighlight(post.highlight.id, HighlightType.Default);
    highlighter.modifyHighlightTemp(HighlightType.Active);
    positionTooltip(e);
    setHoveredHighlightPost(null);
  }, [highlighter, positionTooltip]);

  const addPosts = (postsToAdd: Post | Post[], type: HighlightType) => {
    postsToAdd = toArray(postsToAdd);
    for (const post of postsToAdd) {
      highlighter.addHighlight(post, type);
    }

    // Add post(s) to list of posts
    dispatch({ type: ListReducerActionType.UpdateOrAdd, data: postsToAdd });
  }

  const removePosts = (postsToRemove: Post | Post[]) => {
    postsToRemove = toArray(postsToRemove);
    for (const post of postsToRemove) {
      if (!post.highlight) continue;
      highlighter.removeHighlight(post.highlight.id);
    }

    // Remove post(s) from list of posts
    dispatch({ type: ListReducerActionType.Remove, data: postsToRemove });
  }

  // Can we put these useeffects in a for loop?
  useEffect(() => {
    highlighter.highlights.forEach((highlight, id) => {
      const onMouseEnter = (e: MouseEvent) => onHighlightMouseEnter(e, highlight.post);
      for (const mark of highlight.marks) {
        mark.addEventListener('mouseenter', onMouseEnter);
        highlight.handlers.mouseenter = onMouseEnter;
      }
    });

    return () => {
      highlighter.highlights.forEach((highlight, id) => {
        for (const mark of highlight.marks) {
          if (highlight.handlers?.mouseenter) {
            mark.removeEventListener('mouseenter', highlight.handlers.mouseenter);
            delete highlight.handlers.mouseenter;
          }
        }
      });
    }
  }, [posts, onHighlightMouseEnter]);

  useEffect(() => {
    highlighter.highlights.forEach((highlight, id) => {
      const onMouseLeave = (e: MouseEvent) => onHighlightMouseLeave(e, highlight.post);
      for (const mark of highlight.marks) {
        mark.addEventListener('mouseleave', onMouseLeave);
        highlight.handlers.mouseleave = onMouseLeave;
      }
    });

    return () => {
      highlighter.highlights.forEach((highlight, id) => {
        for (const mark of highlight.marks) {
          if (highlight.handlers?.mouseleave) {
            mark.removeEventListener('mouseleave', highlight.handlers.mouseleave);
            delete highlight.handlers.mouseleave;
          }
        }
      });
    }
  }, [posts, onHighlightMouseLeave]);

  const removeTempHighlight = useCallback(() => {
    highlighter.removeHighlightTemp();
    setTempHighlight(null);
    setTempHighlightId('');
    setTempHighlightRange(null);
    setIsTempHighlightVisible(false);
  }, [tempHighlightId]);

  useEffect(() => {
    // Get user object
    get(['user', 'isAuthenticated', 'isExtensionOn'])
      .then((data) => {
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
          };
        });
    } else if ((!isAuthenticated || !isExtensionOn) && posts.length > 0) {
      removePosts(posts);
    }
  }, [didInitialGetPosts, isAuthenticated, isExtensionOn, posts]);

  useEffect(() => {
    // Workaround to force Quill placeholder to change dynamically
    const editor = props.root.querySelector('.ql-editor');
    if (!!hoveredHighlightPost) {
      editor?.setAttribute('data-placeholder', 'No added note');
    } else {
      editor?.setAttribute('data-placeholder', 'Add note');
    }
  }, [hoveredHighlightPost]);

  const selectionExists = (selection: Selection | null) => {
    return !!selection
      && selection.rangeCount > 0
      && !selection.isCollapsed
      && selection.toString().length > 0
      && !selection.toString().match(/^\n+$/i);
  }

  const onSelectionChange = () => {
    // Don't set isSelectionVisible to true here because we only want tooltip to appear after 
    // user has finished dragging selection. We set this in positionTooltip instead.
    const selection = getSelection();
    if (!selectionExists(selection)) {
      setIsSelectionVisible(false);
    }
  }

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
    removeTempHighlight();
  }, [removeTempHighlight]);

  useEffect(() => {
    if (isTempHighlightVisible || isSelectionVisible) {
      document.addEventListener('mousedown', onMouseDownPage);
    } else {
      document.removeEventListener('mousedown', onMouseDownPage);
    }

    return () => document.removeEventListener('mousedown', onMouseDownPage);
  }, [isTempHighlightVisible, isSelectionVisible, onMouseDownPage]);

  const addTopic = (topic: Partial<ITopic>) => {
    if (topics.some((t) => t.text?.toLowerCase() === topic.text?.toLowerCase())) return;
    const newTopics = topics.slice().filter(t => t.id !== topic.id);
    newTopics.unshift(topic);
    setTopics(newTopics);
  }

  const renderTopics = useCallback((post?: Post) => {
    const pills = (post ? post.topics : topics).map(topic =>
      <Pill
        key={topic.text}
        color={topic.color!}
        text={topic.text!}
        onClose={() => { setTopics(topics.slice().filter(t => t !== topic)); }}
        showClose={!post}
        style={{ marginBottom: '3px' }}
      />
    );

    return (
      <div className="TbdTooltip__TopicList">
        {!post && <InputPill onSubmit={addTopic} style={{ marginBottom: '3px' }} />}
        {pills}
      </div>
    );
  }, [topics]);

  // TODO: Store temp highlight stuff inside highlighter
  const onMouseDownTooltip = () => {
    const selection = getSelection();
    if (selection?.toString()) {
      const range = selection.getRangeAt(0);
      const textRange = getTextRangeFromRange(range);
      setTempHighlight({
        textRange: textRange,
        url: window.location.href
      });

      const id = uuid();
      setTempHighlightId(id);
      setTempHighlightRange(range.cloneRange());
      setIsTempHighlightVisible(true);
      highlighter.addHighlightTemp(range, user?.color, HighlightType.Active);
      selection.removeAllRanges();
    }
  }

  const onEditorChange = (content: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => {
    // console.log("content", content);
    // console.log("delta", delta);
    // console.log("editor.getSelection", editor.getSelection(false));
    // console.log('\n')

    // NEED TO BE ABLE TO GET WHERE THE CURRENT CURSOR IS

    // Get current word cursor is in and check if it has an @

    // get textAfter @ (until space)
    // get 
    // if it does and textAfter is empty, inject <p> tags into content

    // else use textAfter to search for users


    // check if the user is starting to tag someone
    // if (delta.ops?.find((op) => op.insert === "@")) {
    // 
    // }
    setEditorValue(content);
  }

  // suggestUsers sets the suggested users

  // const test = useCallback((e: KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     // const s1 = getSelection();
  //     // if (!s1) return; 
  //   }
  // }, [posts]);

  // useEffect(() => {
  //   document.addEventListener('keyup', test); 
  //   return () => document.removeEventListener('keyup', test);
  // }, [test])

  const onClickRemove = () => {

  }

  const onClickSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (tempHighlight) {
      const postReq = {
        content: editorValue,
        url: window.location.href,
        taggedUserIds: [],
        highlight: tempHighlight,
        topics: topics
      };

      // Hide tooltip
      setIsSelectionVisible(false);
      setIsTempHighlightVisible(false);

      // Reset tooltip state
      setEditorValue('');
      setTopics([]);

      // Show actual highlight when we get response from server
      sendMessageToExtension({ type: MessageType.CreatePost, post: postReq }).then((res: IPostRes) => {
        if (res.success && res.post) {
          removeTempHighlight();
          addPosts(new Post(res.post), HighlightType.Default);
        } else {
          // Show that highlighting failed
          throw new ExtensionError(res.message!, 'Error creating highlight, try again!');
        }
      });
    }
  }

  return (
    <>
      {hoveredHighlightPost ? (
        <div
          className={classNames('TbdTooltip', {
            'TbdTooltip--position-above': positionEdge === Edge.Top,
            'TbdTooltip--position-below': positionEdge === Edge.Bottom,
            'TbdTooltip--readonly': true
          })}
          style={{ 
            transform: `translate3d(${position.x}px, ${position.y}px, 0px)`, 
            display: !hoveredHighlightPost.content && hoveredHighlightPost.topics.length === 0 
              ? 'flex' 
              : undefined
          }}
        >
          <div className="TroveTooltip__Profile">
            <div
              className="TroveTooltip__ProfileImg"
              style={{
                backgroundColor: hoveredHighlightPost.creator.color,
                color: Color(hoveredHighlightPost.creator.color).isLight() ? 'black' : 'white',
              }}            >
              {hoveredHighlightPost.creator.displayName[0]}
            </div>
            <div className="TroveTooltip__ProfileInfo">
              <div className="TroveTooltip__DisplayName">{hoveredHighlightPost.creator.displayName}</div>
              <div
                className="TroveTooltip__Username"
                style={{ color: hoveredHighlightPost.creator.color }}
              >
                {`@${hoveredHighlightPost.creator.username}`}
              </div>
            </div>
          </div>
          {renderTopics(hoveredHighlightPost)}
          {hoveredHighlightPost.content && (
            <ReactQuill
              className="TroveTooltip__Editor TroveTooltip__Editor--readonly"
              theme="bubble"
              value={hoveredHighlightPost.content}
              placeholder="No note added"
              readOnly={true}
            />
          )}
          {/* <div className="TbdTooltip__ButtonList">
            <button className="TbdTooltip__RemoveButton" onClick={onClickRemove} />
          </div> */}
        </div>
      ) : (
          (isSelectionVisible || isTempHighlightVisible) && (
            <div
              className={classNames('TbdTooltip', {
                'TbdTooltip--position-above': positionEdge === Edge.Top,
                'TbdTooltip--position-below': positionEdge === Edge.Bottom
              })}
              onMouseDown={onMouseDownTooltip}
              style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
            >
                <div className="TroveTooltip__Profile">
              <div
                className="TroveTooltip__ProfileImg"
                style={{
                  backgroundColor: user?.color,
                  color: Color(user?.color).isLight() ? 'black' : 'white',
                }}
              >
                {user?.displayName[0]}
              </div>
              <div className="TroveTooltip__ProfileInfo">
                <div className="TroveTooltip__DisplayName">{user?.displayName}</div>
                <div
                  className="TroveTooltip__Username"
                  style={{ color: user?.color }}
                >
                  {`@${user?.username}`}
                </div>
              </div>
            </div>
              {renderTopics()}
              <ReactQuill
                className="TroveTooltip__Editor"
                theme="bubble"
                value={editorValue}
                onChange={onEditorChange}
                placeholder="Add note"
                ref={quill}
              />
              <button className="TbdTooltip__SubmitButton" onClick={onClickSubmit} />
            </div>
          )
        )}
    </>
  );
}
