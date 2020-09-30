import { deserializeRange } from '@rangy/serializer';
import hexToRgba from 'hex-to-rgba';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import React from 'react';
import Post, { Highlight } from '../../../../models/nodes/Post';
import Highlighter, { HighlightClass } from '../../helpers/Highlighter';

interface PostProps {
  highlighter: Highlighter;
  post: Post;
  highlight?: Highlight;
}

export default function Post(props: PostProps) {
  const onMouseEnterPost = (e: React.MouseEvent) => {
    console.log('mouseenterpost')
    if (props.highlight?.range) {
      const range = deserializeRange(props.highlight.range);
      const color = hexToRgba(props.post.creator.color, 0.1);
      props.highlighter.addHighlight(range, HighlightClass.HoverPost, color);
    }
  }

  const onMouseLeavePost = (e: React.MouseEvent) => {
    props.highlighter.removeHighlight(HighlightClass.HoverPost);
  }

  const onClickPost = (e: React.MouseEvent) => {
    if (props.highlight?.range) {
      const range = deserializeRange(props.highlight.range);
      const color = hexToRgba(props.post.creator.color, 0.25);
      props.highlighter.addHighlight(range, HighlightClass.Post, color);
    }
  }

  const getContent = () => {
    // TODO: color tagged handles appropriately
    return (
      <div className="TbdPost__Content">
        {props.post.content}
      </div>
    );
  }

  const getTimeAgo = () => {
    TimeAgo.addLocale(en);
    const timeAgo = new TimeAgo('en-US');
    return timeAgo.format(props.post.creationDatetime, 'twitter');
  }

  return (
    <div 
      className="TbdPost" 
      onClick={onClickPost}
      onMouseEnter={onMouseEnterPost}
      onMouseLeave={onMouseLeavePost}
    >
      <div className="TbdPost__Left">
        <div 
          className="TbdPost__UserBubble" 
          style={{ backgroundColor: props.post.creator.color }}
        >
          {props.post.creator.username[0]}
        </div>
      </div>
      <div className="TbdPost__Right">
        <div className="TbdPost__Header">
          <p className="TbdPost__Header__DisplayName">
            {props.post.creator.displayName}
          </p>
          <p 
            className="TbdPost__Header__Username"
            style={{ color: props.post.creator.color }}
          >
            {`@${props.post.creator.username}`}
          </p>
          <p className="TbdPost__Header__Datetime">{getTimeAgo()}</p>
        </div>
        {getContent()}
        <div className="TbdPost__Buttons">
          {/* only comment button for now */}
        </div>
      </div>
    </div>
  );
}
