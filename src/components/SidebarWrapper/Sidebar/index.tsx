import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import { IPostsRes } from '../../../server/posts';
import { get, key, set } from '../../../utils/chrome/storage';
import { getTabId, Message, MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Edge from '../helpers/Edge';
import Highlighter from '../helpers/highlight/Highlighter';
import Point from '../helpers/Point';
import NewPost from './NewPost';
import PostComponent from './Post';

export const SIDEBAR_MARGIN = 15;
export const SIDEBAR_MARGIN_Y = 100;
export const BUBBLE_HEIGHT = 55;
export const BUBBLE_MARGIN = 20;
export const CONTENT_HEIGHT = 400;
export const CONTENT_WIDTH = 300;
export const EXIT_BUBBLE_WIDTH = 55;
export const DEFAULT_POSITION = new Point(
  document.documentElement.clientWidth - BUBBLE_HEIGHT - SIDEBAR_MARGIN, 
  SIDEBAR_MARGIN_Y
);

export default function Sidebar() {
  const [closestEdge, setClosestEdge] = useState(Edge.Right);
  const [highlighter, setHighlighter] = useState(new Highlighter());
  const [isComposing, setIsComposing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtensionOn, setIsExtensionOn] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [offset, setOffset] = useState(new Point(0, 0));
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [posts, setPosts] = useState([] as Post[]);
  const [replyingToPost, setReplyingToPost] = useState<Post | null>(null);
  const [runOnceInitialAnchor, setRunOnceInitialAnchor] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const [tabId, setTabId] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [wasDragged, setWasDragged] = useState(false);
  const bubbleRef = useRef(null);
  const scrollRef = useRef(null);
  
  const getSidebarHeight = useCallback(() => {
    return isOpen ? BUBBLE_HEIGHT + BUBBLE_MARGIN + CONTENT_HEIGHT : BUBBLE_HEIGHT;
  }, [isOpen]);

  const getSidebarWidth = useCallback(() => {
    return isOpen ? CONTENT_WIDTH : BUBBLE_HEIGHT;
  }, [isOpen]);

  /**
   * Get width of vertical scrollbar.
   * TODO: Can prob be faster, memoize per page.
   */
  const getScrollbarDx = () => {
    const html = document.querySelector('html');
    if (html) return window.innerWidth - html.offsetWidth;

    // Check if scrollbar actually exists
    const overflow = document.body.scrollHeight > document.body.clientHeight;
    const computed = window.getComputedStyle(document.body, null);
    const exists = computed.overflow === 'visible'
      || computed.overflowY === 'visible'
      || (computed.overflow === 'auto' && overflow)
      || (computed.overflowY === 'auto' && overflow);
    if (!exists) return 0;

    // Fallback method: append hidden element, force scrollbar, and calc width
    const scrollDiv = document.createElement('div');
    const styles = {
      width: '100px',
      height: '100px',
      overflow: 'scroll',
      position: 'absolute',
      top: '-9999px'
    };
    Object.assign(scrollDiv.style, styles);
    document.body.appendChild(scrollDiv);

    // Calc width and remove element
    const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
    return scrollbarWidth;
  }

  const anchorSidebar = useCallback(() => {
    // Calc screen bounds
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = (window.innerWidth - getScrollbarDx()) || document.documentElement.clientWidth;

    // Calc distance to each edge
    const leftDx = position.x - 0;
    const rightDx = width - (position.x + getSidebarWidth());

    // Set new position on closest edge
    const minY = SIDEBAR_MARGIN;
    const maxY = height - getSidebarHeight() - SIDEBAR_MARGIN;
    const newY = Math.min(Math.max(minY, position.y), maxY);
    if (leftDx < rightDx) {
      setPosition(new Point(SIDEBAR_MARGIN, newY));
      setClosestEdge(Edge.Left);
    } else { 
      const newX = width - BUBBLE_HEIGHT - SIDEBAR_MARGIN;
      setPosition(new Point(newX, newY));
      setClosestEdge(Edge.Right);
    }
  }, [position, tabId, getSidebarWidth, getSidebarHeight]);

  const snapToExitBubble = (e: MouseEvent | TouchEvent) => {
    const point = Point.fromEvent(e)
    
    // Get exit bubble point
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = (window.innerWidth - getScrollbarDx()) || document.documentElement.clientWidth;
    const exitCenter = new Point(width/2, height * 0.9);

    // Snap to center of exit bubble if cursor is dragging logo bubble w/in a 40px radius
    if (point.getDistance(exitCenter) < 40) {
      setShouldHide(true);
      return exitCenter.getOffset(new Point(BUBBLE_HEIGHT/2, BUBBLE_HEIGHT/2));
    }

    setShouldHide(false);
    return null;
  }

  const onClickBubble = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wasDragged) {
      // Click event firing after drag
      setWasDragged(false);
    } else {
      // Normal click
      setIsOpen(!isOpen);
    }

    if (shouldHide) {
      setShouldHide(false);
      setIsExtensionOn(false);
    }
  }, [isOpen, shouldHide, tabId, wasDragged, anchorSidebar]);

  const onClickPage = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    (bubbleRef.current! as HTMLElement).dispatchEvent(event);
  }, [bubbleRef]);

  const onClickNewPostButton = useCallback((e: React.MouseEvent) => {
    if (!isComposing) {
      // Reset scroll on list of posts
      if (scrollRef.current) (scrollRef.current! as HTMLDivElement).scrollTop = 0;
    }

    setReplyingToPost(null);
    setIsComposing(!isComposing);
  }, [isComposing]);

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setOffset(Point.fromEvent(e).getOffset(position));
    setIsDragging(true);
  }, [position]);

  const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDragging) {
      setIsOpen(false);
      setWasDragged(true);

      // Snap to exit bubble if applicable
      setPosition(snapToExitBubble(e) || Point.fromEvent(e).getOffset(offset));
    }
  }, [isDragging, isOpen, offset]);

  const onDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // onClick isn't called after a drag if mouseup is beyond bounds of window 
    if (wasDragged) anchorSidebar();
  }, [offset, wasDragged, anchorSidebar]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onDragEnd);
    } else {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onDragEnd);
    }

    return () => { 
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onDragEnd);
    }
  }, [isDragging, onDrag, onDragEnd]);

  useEffect(() => {
    if (wasDragged) {
      document.addEventListener('click', onClickPage);
    } else {
      document.removeEventListener('click', onClickPage);
    }

    return () => { document.removeEventListener('click', onClickPage); };
  }, [wasDragged, onClickPage]);

  useEffect(() => {
    // anchorSidebar();
    set({ [key(tabId, 'isOpen')]: isOpen });
  }, [isOpen]);

  useEffect(() => {
    if (!isDragging && !position.equals(DEFAULT_POSITION)) {
      console.log('updating position: ' + position)
      // anchorSidebar();
      set({ [key(tabId, 'position')]: Point.toJSON(position) });
    }
  }, [position]);

  const onResizeWindow = useCallback(() => {
    anchorSidebar();
  }, [anchorSidebar]);

  useEffect(() => {
    window.addEventListener('resize', onResizeWindow);
    return () => window.removeEventListener('resize', onResizeWindow);
  }, [onResizeWindow]);

  const onMessage = useCallback((
    message: Message, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response: any) => void
  ) => {
    switch (message.type) {
      case MessageType.Sync:
        break; 
    }

    return true;
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(onMessage);
    return () => { chrome.runtime.onMessage.removeListener(onMessage); };
  }, [onMessage]);

  useEffect(() => {
    console.log('default position: ' + DEFAULT_POSITION)
    getTabId().then((tabId) => {
      setTabId(tabId);

      // Load & set settings
      get({
        isAuthenticated: false,
        isExtensionOn: false,
        user: null,
        [key(tabId, 'isOpen')]: false,
        [key(tabId, 'position')]: DEFAULT_POSITION 
      }).then((items) => {
        console.log('getting position: ' + Point.fromJSON(items[key(tabId, 'position')]))
        setIsExtensionOn(items.isAuthenticated && items.isExtensionOn);
        setIsOpen(items[key(tabId, 'isOpen')]);
        setPosition(Point.fromJSON(items[key(tabId, 'position')]));
        setUser(items.user);
        setRunOnceInitialAnchor(true);
      });
    });
    
    // Listener to update extension-wide settings
    chrome.storage.onChanged.addListener((change) => {
      if (change.isExtensionOn !== undefined) {
        if (change.user.newValue) setIsExtensionOn(change.isExtensionOn.newValue);
        else setIsExtensionOn(false);
      }
      if (change.user !== undefined) {
        if (change.user.newValue) setUser(new User(change.user.newValue));
        else setUser(null)
      }
    });
  }, []);

  useEffect(() => {
    if (runOnceInitialAnchor) {
      anchorSidebar();
      setRunOnceInitialAnchor(false);
    }
  }, [runOnceInitialAnchor, anchorSidebar]);

  useEffect(() => {
    // Get posts for current page
    if (isExtensionOn && isOpen) {
      const url = window.location.href;
      sendMessageToExtension({ type: MessageType.GetPosts, url }).then((res: IPostsRes) => {
        if (res.success) {
          const posts = res.posts!.map((p) => new Post(p));
          setPosts(posts);
        };
      });
    }
  }, [isExtensionOn, isOpen]);

  /**
   * Render list of posts.
   */
  const renderPosts = useCallback(() => {
    const postList = posts.map(post => (
      <PostComponent 
        key={post.id} 
        highlighter={highlighter} 
        post={post} 
        setIsComposing={setIsComposing}
        setReplyingToPost={setReplyingToPost} 
      />
    ));
    return (
      <div className="TbdSidebar__MainContent__PostList">
        {postList}
      </div>
    );
  }, [posts]);

  // Classes
  const positionText = closestEdge === Edge.Left ? 'left' : 'right';
  const contentPositionClass = `TbdSidebar__MainContent--position-${positionText}`;
  const newPostButtonClass = isComposing ? 'TbdSidebar__MainContent__NewPostButton--composing' : '';
  const exitBubbleHoveredClass = shouldHide ? 'TbdExitBubble--hovered' : '';

  // Styles
  const sidebarStyles = useMemo(() => ({
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging ? 'none' : 'transform 150ms'
  }), [isDragging, position]);

  const logoBubbleStyles = useMemo(() => ({
    cursor: wasDragged ? 'move' : 'pointer',
    marginBottom: `${isOpen ? BUBBLE_MARGIN : 0}px`
  }), [isOpen, wasDragged]);

  const contentStyles = useMemo(() => {
    const transform = (closestEdge === Edge.Right && isOpen)
      ? `translate(${-CONTENT_WIDTH + BUBBLE_HEIGHT}px, 0px)`
      : 'translate(0px, 0px)';
    return { transform }; 
  }, [closestEdge, isOpen]);

  return (
    <>
      {isExtensionOn && (
        <div className="TbdSidebar" style={sidebarStyles}>
          <div
            className="TbdSidebar__LogoBubble"
            onClick={onClickBubble}
            onMouseDown={onDragStart}
            ref={bubbleRef}
            style={logoBubbleStyles}
          >
          </div>
          {isOpen && (
            <div 
              className={`TbdSidebar__MainContent ${contentPositionClass}`}
              style={contentStyles}
            >
              <div className="TbdSidebar__MainContent__Wrapper" ref={scrollRef}>
                {isComposing && user && (
                  <NewPost
                    highlighter={highlighter} 
                    posts={posts}
                    replyingToPost={replyingToPost}
                    setIsComposing={setIsComposing} 
                    setPosts={setPosts}
                    user={user} 
                  />
                )}
                {(posts.length === 0) && (
                  <div className="TbdSidebar__MainContent__EmptyMsg">No posts yet!</div>
                )}
                {renderPosts()}
                <button
                  className={`TbdSidebar__MainContent__NewPostButton ${newPostButtonClass}`} 
                  onClick={onClickNewPostButton}
                />
              </div>
            </div>
          )}
        </div>
      )}
      {wasDragged && <div className={`TbdExitBubble ${exitBubbleHoveredClass}`}></div>}
    </>
  );
}