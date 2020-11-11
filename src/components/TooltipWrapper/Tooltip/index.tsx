import classNames from 'classnames';
import hexToRgba from 'hex-to-rgba';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import { v4 as uuid } from 'uuid';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import ITopic from '../../../models/ITopic';
import { createPost, HighlightParam, IPostsRes } from '../../../server/posts';
import { get } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Edge from '../../SidebarWrapper/helpers/Edge';
import Highlighter, { HighlightType } from '../../SidebarWrapper/helpers/highlight/Highlighter';
import { getRangeFromXRange, getXRangeFromRange } from '../../SidebarWrapper/helpers/highlight/rangeUtils';
import Point from '../../SidebarWrapper/helpers/Point';
import InputPill from './InputPill';
import Pill from './Pill';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 200;

export default function Tooltip() {
  const [editorValue, setEditorValue] = useState('');
  const [highlight, setHighlight] = useState<HighlightParam | null>(null);
  const [highlighter, setHighlighter] = useState(new Highlighter());
  const [isSelectionHighlighted, setIsSelectionHighlighted] = useState(false);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [position, setPosition] = useState(new Point(0, 0));
  const [positionEdge, setPositionEdge] = useState(Edge.Bottom);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tempHighlightId, setTempHighlightId] = useState('');
  const [topics, setTopics] = useState<Partial<ITopic>[]>([]); // { color: '#ebebeb', text: 'Politics' }, { color: '#0d77e2', text: 'Gaming' }
  const [user, setUser] = useState<User | null>(null);
  const tooltipRef = useRef<any>(null);

  useEffect(() => {
    // Get user object
    get(['user', 'isAuthenticated', 'isExtensionOn'])
      .then((data) => {
        if (!data.isAuthenticated || !data.isExtensionOn) return;

        // Set current user
        if (data.user) setUser(new User(data.user));

        // Get posts on current page
        const url = window.location.href;
        sendMessageToExtension({ type: MessageType.GetPosts, url }).then((res: IPostsRes) => {
          if (res.success) {
            const posts = res.posts!.map((p) => new Post(p));
            setPosts(posts);
          };
        });
      });
  }, []);

  useEffect(() => {
    if (posts) {
      // TODO: make this more efficient - compare how list changes + modify highlights (dispatch)
      posts.sort((p1, p2) => p2.creationDatetime - p1.creationDatetime)
        .forEach((post) => {
          if (post.highlight) {
            try {
              highlighter.removeHighlight(post.highlight.id);
            } catch (e) {
              console.error(e);
            }
          }
        });

      posts.sort((p1, p2) => p1.creationDatetime - p2.creationDatetime)
        .forEach((post) => {
          if (post.highlight) {
            try {
              const range = getRangeFromXRange(post.highlight.range);
              if (range) {
                highlighter.addHighlight(
                  range, 
                  post.highlight.id, 
                  post.creator.color, 
                  HighlightType.Default
                );
              }
            } catch (e) {
              console.error(e);
            }
          }
        });
    }
  }, [posts]);

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
  const positionTooltip = useCallback(() => {
    const selection = getSelection();
    if (selectionExists(selection)) {
      if (isSelectionHighlighted) {
        highlighter.removeHighlight(tempHighlightId);
        setIsSelectionHighlighted(false);
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
    setIsSelectionHighlighted(false);
    setIsSelectionVisible(false);
  }, [tempHighlightId]);

  useEffect(() => {
    if (isSelectionHighlighted || isSelectionVisible) {
      document.addEventListener('mousedown', onMouseDownPage);
    } else {
      document.removeEventListener('mousedown', onMouseDownPage);
    }
    
    return () => document.removeEventListener('mousedown', onMouseDownPage);
  }, [isSelectionHighlighted, isSelectionVisible, onMouseDownPage]);

  const addTopic = (topic: Partial<ITopic>) => {
    const newTopics = topics.slice().filter(t => t !== topic);
    newTopics.unshift(topic);
    setTopics(newTopics);
  }

  const renderTopics = useCallback(() => {
    const pills = topics.map(topic =>
      <Pill 
        key={topic.text} 
        color={topic.color} 
        text={topic.text}
        onClose={() => { setTopics(topics.slice().filter(t => t !== topic)); }}
      />
    );

    return (
      <div className="TbdTooltip__TopicList">
        <InputPill onSubmit={addTopic} />
        {pills}
      </div>
    );
  }, [topics]);

  const onMouseDownTooltip = () => {
    const selection = getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      const xrange = getXRangeFromRange(range);
      setHighlight({
        // context: selection.toString(),
        range: xrange,
        text: selection.toString(),
        url: window.location.href
      });

      setIsSelectionHighlighted(true);
      const id = uuid();
      const color = user ? hexToRgba(user.color, 0.25) : 'yellow';
      setTempHighlightId(id);
      highlighter.addHighlight(range, id, color, HighlightType.Active);
      selection.removeAllRanges();
    }
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
      setIsSelectionHighlighted(false);
      setEditorValue('');
      const postRes = await createPost(postReq);
      if (postRes.success && postRes.post) {
        if (tempHighlightId) {
          highlighter.removeHighlight(tempHighlightId);
          setTempHighlightId('');
        }
        
        const newPosts = posts.slice();
        newPosts.push(new Post(postRes.post));
        setPosts(newPosts);
      } else {
        // Show that highlighting failed
      }

      // // @ts-ignore
      // posts.push({
      //   ...post, 
      //   creationDatetime: Date.now(),
      //   id: uuid(),
      //   creator: user!,
      //   domain: '',
      //   numComments: 0,
      //   numLikes: 0,
      //   isComment: false,
      //   isTopOfThread: false,
      //   timeAgo: ''
      // });
      // console.log(editorRef.current, editorRef.current.value, editorRef.current.html, editorRef.current.innerHtml);
      // for (const key in editorRef.current) console.log(key)
    }
  }

  return (
    <>
      {(isSelectionVisible || isSelectionHighlighted) && (
        <div 
          className={classNames('TbdTooltip', {
            'TbdTooltip--position-above': positionEdge === Edge.Top,
            'TbdTooltip--position-below': positionEdge === Edge.Bottom
          })}
          onMouseDown={onMouseDownTooltip}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
          ref={tooltipRef}
        >
          {renderTopics()}
          <ReactQuill 
            className="TroveTooltip__Editor" 
            theme="bubble" 
            value={editorValue} 
            onChange={setEditorValue}
            placeholder="Add note"
          />
          <button className="TbdTooltip__SubmitButton" onClick={onClickSubmit} />
        </div>
      )}
    </>
  );
}
