import classNames from 'classnames';
import hexToRgba from 'hex-to-rgba';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Post from '../../../entities/Post';
import User from '../../../entities/User';
import ITopic from '../../../models/ITopic';
import IUser from '../../../models/IUser';
import { createPost, IPostsRes } from '../../../server/posts';
import { get1 } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import Edge from '../../SidebarWrapper/helpers/Edge';
import { addHighlight } from '../../SidebarWrapper/helpers/highlight/highlightUtils';
import { getRangeFromXRange, getXRangeFromRange } from '../../SidebarWrapper/helpers/highlight/rangeUtils';
import Point from '../../SidebarWrapper/helpers/Point';
import InputPill from './InputPill';
import Pill from './Pill';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 45;

export default function Tooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(new Point(0, 0));
  const [positionEdge, setPositionEdge] = useState(Edge.Bottom);
  const [posts, setPosts] = useState<Post[]>([]);
  const [topics, setTopics] = useState<Partial<ITopic>[]>([{ color: '#ebebeb', text: 'Politics' }, { color: '#0d77e2', text: 'Gaming' }]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user object
    get1('user').then((userData: IUser) => setUser(new User(userData)));

    // Get posts on current page
    const url = window.location.href;
    sendMessageToExtension({ type: MessageType.GetPosts, url }).then((res: IPostsRes) => {
      if (res.success) {
        const posts = res.posts!.map((p) => new Post(p));
        setPosts(posts);
      };
    });
  }, []);

  useEffect(() => {
    if (posts) {
      posts.sort((p1, p2) => p1.creationDatetime - p2.creationDatetime)
        .forEach((post) => {
          if (post.highlight) {
            try {
              const range = getRangeFromXRange(post.highlight.range);
              if (range) addHighlight(range, post.highlight.id, post.creator.color);
            } catch (e) {
              console.error(e);
            }
          }
        });
    }
  }, [posts]);

  /**
   * Position and display tooltip according to change in selection.
   */
  const onSelectionChange = useCallback(() => {
    const selection = getSelection(); console.log('onSelectionChange')
    if (
      selection 
      && selection.rangeCount 
      && !selection.isCollapsed 
      && selection.toString()
    ) {
      const selPos = selection.getRangeAt(0).getBoundingClientRect();
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
      
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    window.addEventListener('resize', onSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', onSelectionChange);
      window.removeEventListener('resize', onSelectionChange);
    };
  }, [onSelectionChange]);

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
        {pills}
        <InputPill />
      </div>
    );
  }, [topics]);

  const onClickSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const selection = getSelection();
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);
      const xrange = getXRangeFromRange(range);
      createPost({
        content: selection.toString(),
        url: window.location.href,
        taggedUserIds: [],
        highlight: {
          context: selection.toString(),
          range: xrange,
          text: selection.toString(),
          url: window.location.href
        },
        topics: []
      });

      const color = user ? hexToRgba(user.color, 0.25) : 'yellow';
      addHighlight(range, uuid(), color);
      selection.removeAllRanges();
    }
  }

  return (
    <>
      {isVisible && (
        <div 
          className={classNames('TbdTooltip', {
            'TbdTooltip--position-above': positionEdge === Edge.Top,
            'TbdTooltip--position-below': positionEdge === Edge.Bottom
          })}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
        >
          {renderTopics()}
          <button className="TbdTooltip__SubmitButton" onClick={onClickSubmit} />
        </div>
      )}
    </>
  );
}
