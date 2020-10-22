import { deserializeRange } from '@rangy/serializer';
import hexToRgba from 'hex-to-rgba';
import React from 'react';
import { default as IPost, default as PostObject } from '../../../../entities/Post';
import IHighlight from '../../../../models/IHighlight';
import Highlighter, { HighlightClass } from '../../helpers/Highlighter';

interface PostProps {
  highlighter: Highlighter;
  post: PostObject;
  setIsComposing: React.Dispatch<React.SetStateAction<boolean>>; 
  setReplyingToPost: React.Dispatch<React.SetStateAction<IPost | null>>;
  highlight?: IHighlight;
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

  const onClickReplyButton = () => {
    props.setReplyingToPost(props.post);
    props.setIsComposing(true);
  }

  const getContent = () => {
    // TODO: color tagged handles appropriately
    // see notification i already have this
    return (
      <div className="TbdPost__Content">
        {props.post.content}
      </div>
    );
  }
  
  return (
    <div 
      className="TbdPost" 
      onClick={onClickPost}
      onMouseEnter={onMouseEnterPost}
      onMouseLeave={onMouseLeavePost}
    >
      <div className="TbdPost__Wrapper">
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
            <p className="TbdPost__Header__Datetime">{props.post.timeAgo}</p>
          </div>
          {getContent()}
          <div className="TbdPost__Buttons">
            <button 
              className="TbdPost__Button TbdPost__Buttons__Reply"
              onClick={onClickReplyButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
