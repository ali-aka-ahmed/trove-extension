import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import { v4 as uuid } from 'uuid';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import ITopic from '../../../models/ITopic';
import { createPost, HighlightParam, IPostsRes } from '../../../server/posts';
import { get } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Edge from './helpers/Edge';
import Highlighter, { HighlightType } from './helpers/highlight/Highlighter';
import { getRangeFromTextRange, getTextRangeFromRange } from './helpers/highlight/textRange';
import Point from './helpers/Point';
import InputPill from './InputPill';
import Pill from './Pill';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 200;

interface TooltipProps {
  root: ShadowRoot;
}

export default function Tooltip(props: TooltipProps) {
  const [editorValue, setEditorValue] = useState('');
  const [highlight, setHighlight] = useState<HighlightParam | null>(null);
  const [highlighter, setHighlighter] = useState(new Highlighter());
  const [hoveredHighlightPost, setHoveredHighlightPost] = useState<Post | null>(null);
  const [isSelectionVisible, setIsSelectionVisible] = useState(false);
  const [isTempHighlightVisible, setIsTempHighlightVisible] = useState(false);
  const [position, setPosition] = useState(new Point(0, 0));
  const [positionEdge, setPositionEdge] = useState(Edge.Bottom);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tempHighlightId, setTempHighlightId] = useState('');
  const [topics, setTopics] = useState<Partial<ITopic>[]>([]); // { color: '#ebebeb', text: 'Politics' }, { color: '#0d77e2', text: 'Gaming' }
  const [user, setUser] = useState<User | null>(null);

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

  const highlightPost = (post: Post, type: HighlightType) => {
    if (!post.highlight || !post.creator || !post.id) return;
    let range: Range | null;
    try {
      range = getRangeFromTextRange(post.highlight.textRange);
    } catch (e) {
      console.error(e);
      return;
    }

    const color = post.creator.color;
    if (!range) return;

    // TODO: check if there's a memory leak when removing highlights
    // Might have to manually remove handlers in removeHighlight
    const onMouseEnter = (e: MouseEvent) => {
      highlighter.addHighlight(range!, post.id, color, HighlightType.Active);
      positionTooltip(e, range!);
      setHoveredHighlightPost(post);
    }
    const onMouseLeave = (e: MouseEvent) => {
      highlighter.addHighlight(range!, post.id, color, HighlightType.Default);
      setHoveredHighlightPost(null);
      positionTooltip(e);
    }
    highlighter.addHighlight(range, post.id, color, type, onMouseEnter, onMouseLeave);
  }

  useEffect(() => {
    // Workaround to force Quill placeholder to change dynamically
    const editor = props.root.querySelector('.ql-editor');
    if (!!hoveredHighlightPost) {
      editor?.setAttribute('data-placeholder', 'No added note');
    } else {
      editor?.setAttribute('data-placeholder', 'Add note');
    }
  }, [hoveredHighlightPost]);

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
        .forEach((post) => highlightPost(post, HighlightType.Default));
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
        
        const newPosts = posts.slice();
        newPosts.push(new Post(postRes.post));
        setPosts(newPosts);
      } else {
        // Show that highlighting failed
      }
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
