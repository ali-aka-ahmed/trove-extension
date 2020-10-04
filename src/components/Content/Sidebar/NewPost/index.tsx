import { getSelection } from '@rangy/core';
import { serializeRange } from '@rangy/serializer';
import { Input } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import User from '../../../../entities/User';
import { CreatePostReqBody } from '../../../../server/posts';
import { get } from '../../../../utils/chrome/storage';
import Highlighter from '../../helpers/Highlighter';

const MAX_POST_LENGTH = 180;
const { TextArea } = Input;

interface NewPostProps {
  highlighter: Highlighter;
  user: User;
}

export default function NewPost(props: NewPostProps) {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [post, setPost] = useState({} as Partial<CreatePostReqBody>);
  const contentRef = useRef<any>(null);

  const canSubmit = useCallback(() => {
    const cantSubmit = !post.highlight 
      || !post.content 
      || post.content.length === 0
      || post.content.length > MAX_POST_LENGTH;
    return !cantSubmit;
  }, [post]);

  const getSubmitWarning = useCallback(() => {
    if (!post.content || post.content.length === 0) {
      return "Post can't be empty.";
    } else if (post.content.length > MAX_POST_LENGTH) {
      return `Post can't exceed ${MAX_POST_LENGTH} characters.`;
    } else if (!post.highlight) {
      return 'Must link post to a highlight.';
    }

    return null;
  }, [post]);

  const submit = useCallback(() => {
    // TODO: compute tagged users (this should prob happen in an onChange fn)
    // TODO: make sure anchor was done on this url
    if (!canSubmit()) return;
    setPost({
      ...post,
      url: window.location.href
    });
    
  }, [canSubmit, post]);

  const onClickSubmit = useCallback((e) => {
    submit();
  }, [submit]);

  const onMouseEnterSubmit = (e) => {
    console.log('mouseEnter submit')
    setIsHoveringSubmit(true);
  }

  const onMouseLeaveSubmit = (e) => {
    console.log('mouseLeave submit')
    setIsHoveringSubmit(false);
  }
  
  const onClickHighlightButton = useCallback((e) => {
    if (!isAnchoring) {
      setIsAnchored(false);
    } else {
      // Do nothing for now
    }

    setIsAnchoring(!isAnchoring);
  }, [isAnchoring]);

  useEffect(() => {
    if (isAnchoring) getNewSelection();
  }, [isAnchoring]);

  const onChangeContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost({...post, content: e.target.value});
  }

  const getNewSelection = useCallback(() => {
    const selection = getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      props.highlighter.addNewPostHighlight(range);
      setPost({
        ...post, 
        highlight: {
          context: selection.toString(),
          range: serializeRange(range),
          text: selection.toString(),
          url: window.location.href
        }
      });
      selection.removeAllRanges();
      setIsAnchoring(false);
    }
  }, [post]);

  useEffect(() => {
    if (isAnchoring) {
      document.addEventListener('mouseup', getNewSelection);
    } else {
      document.removeEventListener('mouseup', getNewSelection);
    }

    return () => { document.removeEventListener('mouseup', getNewSelection); };
  }, [isAnchoring, getNewSelection]);

  useEffect(() => {
    if (contentRef.current) contentRef.current.focus();

    // Get user to populate Post props
    // TODO: Get User in Sidebar and pass it in as a prop
    get('user').then((items) => {
      setPost({ 
        ...post,
        content: '',
        creatorUserId: items.user.id
      });
    });
  }, []);

  // Classes
  const highlightActiveClass = isAnchoring ? 'TbdNewPost__Buttons__AddHighlight--active' : '';
  const highlightButtonClass = `TbdNewPost__Buttons__AddHighlight ${highlightActiveClass}`;
  const submitButtonDisabledClass = canSubmit() ? '' : 'TbdNewPost__Button--disabled';

  return (
    <div className="TbdNewPost">
      <div className="TbdNewPost__MainReference">
        {/* <p className="TbdNewPost__MainReference__AddText">Add reference</p> */}
      </div>
      <div className="TbdPost__Wrapper">
        <div className="TbdPost__Left">
          <div 
            className="TbdPost__UserBubble" 
            style={{ backgroundColor: props.user.color }}
          >
            {props.user.username[0]}
          </div>
        </div>
        <div className="TbdPost__Right">  
          <div className="TbdPost__Header">
            <p className="TbdPost__Header__DisplayName">
              {props.user.displayName}
            </p>
            <p 
              className="TbdPost__Header__Username"
              style={{ color: props.user.color }}
            >
              {`@${props.user.username}`}
            </p>
          </div>
          <TextArea 
            className="TbdNewPost__Content"
            placeholder="The pen is mightier than the sword."
            autoSize={{ minRows: 2 }}
            onChange={onChangeContent}
            ref={contentRef}
          />
          <div className="TbdNewPost__Buttons">
            <div className="TbdNewPost__Buttons__Left">
              <button 
                className={`TbdNewPost__Button ${highlightButtonClass}`}
                onClick={onClickHighlightButton}
              />
              <button 
                className={`TbdNewPost__Button TbdNewPost__Buttons__AddReference`}
              />
            </div>
            <div className="TbdNewPost__Buttons__Right">
              <button 
                className={`TbdNewPost__Button ${submitButtonDisabledClass}`}
                onClick={onClickSubmit}
                onMouseEnter={onMouseEnterSubmit}
                onMouseLeave={onMouseLeaveSubmit}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
      {!canSubmit() && isHoveringSubmit && (
        <div className="TbdNewPost__SubmitWarning">
          {getSubmitWarning()}
        </div>
      )}
    </div>
  );
}
