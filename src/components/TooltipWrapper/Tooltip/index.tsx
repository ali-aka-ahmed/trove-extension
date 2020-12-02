import classNames from 'classnames';
import { intersectionBy } from 'lodash';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import ReactQuill from 'react-quill';
import { v4 as uuid } from 'uuid';
import ExtensionError from '../../../entities/ExtensionError';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import ITopic from '../../../models/ITopic';
import { createPost, HighlightParam, IPostsRes } from '../../../server/posts';
import { toArray } from '../../../utils';
import { get } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Edge from './helpers/Edge';
import Highlighter, { HighlightType } from './helpers/highlight/Highlighter';
import { getRangeFromTextRange, getTextRangeFromRange } from './helpers/highlight/textRange';
import Point from './helpers/Point';
import ListReducer, { ListReducerActionType } from './helpers/reducers/ListReducer';
import InputPill from './InputPill';
import Pill from './Pill';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 200;

interface TooltipProps {
  root: ShadowRoot;
}

export default function Tooltip(props: TooltipProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isExtensionOn, setIsExtensionOn] = useState(false);
  const [editorValue, setEditorValue] = useState('');
  const [highlight, setHighlight] = useState<HighlightParam | null>(null);
  const [highlighter, setHighlighter] = useState(new Highlighter());
  const [hoveredHighlightPost, setHoveredHighlightPost] = useState<Post | null>(null);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [isTempHighlightVisible, setIsTempHighlightVisible] = useState(false);
  const [position, setPosition] = useState(new Point(0, 0));
  const [positionEdge, setPositionEdge] = useState(Edge.Bottom);
  const [posts, dispatch] = useReducer(ListReducer<Post>('id'), []);
  const [tempHighlightId, setTempHighlightId] = useState('');
  const [topics, setTopics] = useState<Partial<ITopic>[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const addPosts = (postsToAdd: Post | Post[], type: HighlightType) => {
    postsToAdd = toArray(postsToAdd);
    const postsToRemove = intersectionBy(posts, postsToAdd, 'id');
    removePosts(postsToRemove);

    for (const post of postsToAdd) {
      if (!post.highlight || !post.creator) continue;
      let range: Range | null;
      try {
        range = getRangeFromTextRange(post.highlight.textRange);
        getSelection()!.removeAllRanges();
        if (!range) continue;
      } catch (e) {
        console.error(e);
        continue;
      }

      const id = post.highlight.id;
      const color = post.creator.color;
      const onMouseEnter = (e: MouseEvent) => {
        highlighter.modifyHighlight(id, color, HighlightType.Active);
        positionTooltip(e, range!);
        setHoveredHighlightPost(post);
      }
      const onMouseLeave = (e: MouseEvent) => {
        highlighter.modifyHighlight(id, color, HighlightType.Default);
        setHoveredHighlightPost(null);
        positionTooltip(e);
      }
      highlighter.addHighlight(range, id, color, type, onMouseEnter, onMouseLeave);
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
    if (isAuthenticated && isExtensionOn) {
      if (posts.length === 0) {
        const url = window.location.href;
        sendMessageToExtension({ type: MessageType.GetPosts, url }).then((res: IPostsRes) => {
          if (res.success) {
            const newPosts = res.posts!.map((p) => new Post(p));
            addPosts(newPosts, HighlightType.Default);
          };
        });
      }
    } else {
      removePosts(posts);
    }
  }, [isAuthenticated, isExtensionOn]);

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
    return selection 
      && selection.rangeCount 
      && !selection.isCollapsed 
      && selection.toString()
      && !selection.toString().match(/^\n+$/i);
  }

  /**
   * Position and display tooltip according to change in selection.
   */
  const positionTooltip = useCallback((e: Event, range?: Range) => {
    const selection = getSelection();
    if (range) {
      const rangePos = range.getBoundingClientRect();
      if (rangePos.bottom + TOOLTIP_HEIGHT > document.documentElement.clientHeight) {
        setPositionEdge(Edge.Top);
        setPosition(new Point(
          rangePos.left + window.scrollX, 
          rangePos.top + window.scrollY - TOOLTIP_HEIGHT - TOOLTIP_MARGIN
        ));
      } else {
        setPositionEdge(Edge.Bottom);
        setPosition(new Point(rangePos.left + window.scrollX, rangePos.bottom + window.scrollY));
      }
    } else if (selectionExists(selection)) {
      if (isTempHighlightVisible) {
        highlighter.removeHighlight(tempHighlightId);
        setIsTempHighlightVisible(false);
      }

      const selPos = selection!.getRangeAt(0).getBoundingClientRect();
      if (selPos.bottom + TOOLTIP_HEIGHT > document.documentElement.clientHeight) {
        setPositionEdge(Edge.Top);
        setPosition(new Point(
          selPos.left + window.scrollX, 
          selPos.top + window.scrollY - TOOLTIP_HEIGHT - TOOLTIP_MARGIN
        ));
      } else {
        setPositionEdge(Edge.Bottom);
        setPosition(new Point(selPos.left + window.scrollX, selPos.bottom + window.scrollY));
      }
      
      setIsSelectionVisible(true);
    } else {
      setIsSelectionVisible(false);
    }
  }, [tempHighlightId]);

  useEffect(() => {
    document.addEventListener('mouseup', positionTooltip);
    window.addEventListener('resize', positionTooltip);
    return () => {
      document.removeEventListener('mouseup', positionTooltip);
      window.removeEventListener('resize', positionTooltip);
    };
  }, [positionTooltip]);

  const onSelectionChange = () => {
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
    if (selectionExists(getSelection())) return;

    // Do nothing if user clicks Trove tooltip
    const target = e.target as HTMLElement;
    if (target.className.match(/tbd/i) || target.className.match(/trove/i)) {
      return;
    }

    // Remove temp highlight if it exists
    if (tempHighlightId) {
      highlighter.removeHighlight(tempHighlightId);
      setTempHighlightId('');
    }

    // Hide tooltip
    setIsTempHighlightVisible(false);
    setIsSelectionVisible(false);
  }, [tempHighlightId]);

  useEffect(() => {
    if (isTempHighlightVisible || isSelectionVisible) {
      document.addEventListener('mousedown', onMouseDownPage);
    } else {
      document.removeEventListener('mousedown', onMouseDownPage);
    }
    
    return () => document.removeEventListener('mousedown', onMouseDownPage);
  }, [isTempHighlightVisible, isSelectionVisible, onMouseDownPage]);

  const addTopic = (topic: Partial<ITopic>) => {
    const newTopics = topics.slice().filter(t => t !== topic);
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
        style={{marginBottom: '3px'}}
      />
    );

    return (
      <div className="TbdTooltip__TopicList">
        {!post && <InputPill onSubmit={addTopic} style={{marginBottom: '3px'}} />}
        {pills}
      </div>
    );
  }, [topics]);

  const onMouseDownTooltip = () => {
    const selection = getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      const textRange = getTextRangeFromRange(range);
      setHighlight({
        textRange: textRange,
        url: window.location.href
      });

      setIsTempHighlightVisible(true);
      const id = uuid();
      setTempHighlightId(id);
      highlighter.addHighlight(range, id, user?.color, HighlightType.Active);
      selection.removeAllRanges();
    }
  }

  const onEditorChange = (content: string) => {
    setEditorValue(content);
  }

  // const test = useCallback((e: KeyboardEvent) => {
  //   if (e.key === 'Enter') {
  //     const s1 = getSelection();
  //     if (!s1) return; 

  //   }
  // }, []);

  // useEffect(() => {
  //   document.addEventListener('keyup', test); 
  //   return () => document.removeEventListener('keyup', test);
  // }, [test])

  const onClickRemove = () => {

  }

  const onClickSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (highlight) {
      const postReq = {
        content: editorValue,
        url: window.location.href,
        taggedUserIds: [],
        highlight: highlight,
        topics: topics
      };
      
      setIsSelectionVisible(false);
      setIsTempHighlightVisible(false);
      setEditorValue('');
      setTopics([])
      const postRes = await createPost(postReq);
      if (postRes.success && postRes.post) {
        if (tempHighlightId) {
          highlighter.removeHighlight(tempHighlightId);
          setTempHighlightId('');
        }

        addPosts(postRes.post, HighlightType.Default);
      } else {
        // Show that highlighting failed
        throw new ExtensionError(postRes.message!, 'Error creating highlight, try again!');
      }
    }
  }

  if (!isExtensionOn || !isAuthenticated) return <></>;
  return (
    <>
      {hoveredHighlightPost ? (
        <div 
          className={classNames('TbdTooltip', {
            'TbdTooltip--position-above': positionEdge === Edge.Top,
            'TbdTooltip--position-below': positionEdge === Edge.Bottom,
            'TbdTooltip--readonly': true
          })}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
        >
          {renderTopics(hoveredHighlightPost)}
          <ReactQuill 
            className="TroveTooltip__Editor TroveTooltip__Editor--readonly" 
            theme="bubble"
            value={hoveredHighlightPost.content} 
            placeholder="No note added"
            readOnly={true}
          />
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
            {renderTopics()}
            <ReactQuill 
              className="TroveTooltip__Editor" 
              theme="bubble" 
              value={editorValue} 
              onChange={onEditorChange}
              placeholder="Add note"
            />
            <button className="TbdTooltip__SubmitButton" onClick={onClickSubmit} />
          </div>
        )
      )}
    </>
  );
}
