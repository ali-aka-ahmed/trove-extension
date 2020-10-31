import hexToRgba from 'hex-to-rgba';
import React, { useState } from 'react';
import { default as IPost, default as PostObject } from '../../../../entities/Post';
import Highlighter, { HighlightType } from '../../helpers/highlight/Highlighter';
import { getRangeFromXRange, getXRangeFromRange, XRange } from '../../helpers/highlight/rangeUtils';

interface PostProps {
  highlighter: Highlighter;
  post: PostObject;
  setIsComposing: React.Dispatch<React.SetStateAction<boolean>>; 
  setReplyingToPost: React.Dispatch<React.SetStateAction<IPost | null>>;
}

export default function Post(props: PostProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [savedSelection, setSavedSelection] = useState<XRange | null>(null);

  const saveSelection = () => {
    const selection = getSelection()!;
    if (selection.rangeCount > 0) {
      const xrange = getXRangeFromRange(selection.getRangeAt(0));
      setSavedSelection(xrange);
      selection.removeAllRanges();
    }
  }

  const restoreSelection = () => {
    if (!savedSelection) return;
    const selection = getSelection()!;
    const range = getRangeFromXRange(savedSelection);
    if (range) {
      selection.removeAllRanges();
      selection.addRange(range);
      setSavedSelection(null);
    }
  }

  const onMouseOverPost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isHovering) {
      saveSelection();
      if (props.post.highlight?.range) {
        const range = getRangeFromXRange(props.post.highlight.range);
        if (range) {
          const color = hexToRgba(props.post.creator.color, 0.1);
          props.highlighter.addHighlight(range, props.post.id, color, HighlightType.Active);
        }
      }

      setIsHovering(true);
    }
  }

  const onMouseLeavePost = (e: React.MouseEvent) => {
    e.stopPropagation();    
    props.highlighter.removeHighlight(props.post.id);
    restoreSelection();
    setIsHovering(false);
  }

  const onClickPost = (e: React.MouseEvent) => {
    if (props.post.highlight?.range) {
      const range = getRangeFromXRange(props.post.highlight.range);
      if (range) {
        const color = hexToRgba(props.post.creator.color, 0.25);
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
      onMouseOver={onMouseOverPost}
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
          <div className="TbdPost__Tags">
            {props.post?.tags?.map((tag) => (
              <div
                className="TbdPost__TagWrapper"
                key={tag.text}
                style={{ backgroundColor: tag.color }}
              >
                <div className="TbdPost__Tag">{tag.text}</div>
              </div>
            ))}
          </div>
          <div className="TbdPost__Buttons">
            {/* <button 
              className="TbdPost__Button TbdPost__Buttons__Reply"
              onClick={onClickReplyButton}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
