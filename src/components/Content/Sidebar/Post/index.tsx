import hexToRgba from 'hex-to-rgba';
import React from 'react';
import { default as IPost, default as PostObject } from '../../../../entities/Post';
import Highlighter, { HighlightType } from '../../helpers/Highlighter';
import { getRangeFromXRange } from '../../helpers/utils';

interface PostProps {
  highlighter: Highlighter;
  post: PostObject;
  setIsComposing: React.Dispatch<React.SetStateAction<boolean>>; 
  setReplyingToPost: React.Dispatch<React.SetStateAction<IPost | null>>;
}

export default function Post(props: PostProps) {
  const onMouseEnterPost = (e: React.MouseEvent) => {
    console.info('mouseenterpost');

    if (props.post.highlight?.range) {
      const range = getRangeFromXRange(props.post.highlight.range);
      const color = hexToRgba(props.post.creator.color, 0.1);
      if (range) props.highlighter.addHighlight(range, props.post.id, color, HighlightType.Active);
    }
  }

  const onMouseLeavePost = (e: React.MouseEvent) => {
    props.highlighter.removeHighlight(props.post.id);
  }

  const onClickPost = (e: React.MouseEvent) => {
    if (props.post.highlight?.range) {
      const range = getRangeFromXRange(props.post.highlight.range);
      const color = hexToRgba(props.post.creator.color, 0.25);
      if (range) {
        props.highlighter.addHighlight(range, props.post.id, color, HighlightType.Active);
      }
    }
  }

  const onClickReplyButton = () => {
    props.setReplyingToPost(props.post);
    props.setIsComposing(true);
  }

  const getContent = () => {
    // TODO: color tagged handles appropriately
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
            {props.post.creator.displayName[0]}
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
