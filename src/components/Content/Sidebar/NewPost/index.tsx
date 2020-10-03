import { getSelection } from '@rangy/core';
import { Input } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Post from '../../../../models/nodes/Post';
import { User } from '../../../../models/nodes/User';
import { APP_COLOR, ERROR_COLOR } from '../../../../styles/constants';
import { get } from '../../../../utils/chrome/storage';
import Highlighter from '../../helpers/Highlighter';

const MAX_POST_LENGTH = 280;
const { TextArea } = Input;

interface NewPostProps {
  highlighter: Highlighter;
  user: User;
}

export default function NewPost(props: NewPostProps) {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const [post, setPost] = useState({} as Partial<Post>);
  const contentRef = useRef<any>(null);

  const canSubmit = useCallback(() => {
    const cantSubmit = !post.mainReference 
      || !post.content 
      || post.content.length === 0
      || post.content.length > MAX_POST_LENGTH;
    return !cantSubmit;
  }, [post]);

  const submit = useCallback(() => {
    // TODO: compute tagged users (this should prob happen in an onChange fn)
    // TODO: make sure anchor was done on this url
    if (!canSubmit()) return;
    setPost({
      ...post,
      url: '',
      creationDatetime: Date.now()
    });
    
  }, [canSubmit, post]);
  
  const onClickHighlightButton = useCallback((e) => {
    if (!isAnchoring) {
      setIsAnchored(false);
    } else {
      // Do nothing for now
    }

    setIsAnchoring(!isAnchoring);
  }, [isAnchoring]);

  const onClickSubmitButton = useCallback((e) => {
    submit();
  }, [submit]);

  const onClickPage = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.info('comment: clickpage');
    // TODO: anchor point cannot be on tbd elements
    
    // TODO: anchoring via point
    // setPost({
    //   ...post,
    //   anchor: getAnchor(e)
    // });
    // setIsAnchoring(false);
    // setIsAnchored(true);
  }, [post]);

  const getNewSelection = useCallback(() => {
    const selection = getSelection();
    if (selection.toString()) {
      const range = selection.getRangeAt(0);
      props.highlighter.addNewPostHighlight(range);
      selection.removeAllRanges();
      setIsAnchoring(false);
    }
  }, [getSelection]);

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
      const newPost: Partial<Post> = { 
        ...post,
        id: uuid(),
        content: '',
        creator: items.user,
        creatorUserId: items.user.id
      };
      setPost(newPost);
    });
  }, []);

  const mainReferenceText = post.mainReference ? `Referencing "${'hi'}"` : 'Click to add reference';

  // Classes
  const highlightActiveClass = isAnchoring ? 'TbdNewPost__Buttons__AddHighlight--active' : '';
  const highlightbuttonClass = `TbdNewPost__Buttons__AddHighlight ${highlightActiveClass}`;

  // Styles
  const anchorButtonStyles = useMemo(() => ({
    backgroundColor: isAnchored ? APP_COLOR : ERROR_COLOR
  }), [isAnchored]);

  const postButtonStyles = useMemo(() => ({
    backgroundColor: APP_COLOR
  }), []);

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
            {/* <p className="TbdPost__Header__Datetime">{getTimeAgo()}</p> */}
          </div>
          <TextArea 
            className="TbdNewPost__Content"
            placeholder="The pen is mightier than the sword."
            autoSize={{ minRows: 2 }}
            ref={contentRef}
          />
          <div className="TbdNewPost__Buttons">
            <div className="TbdNewPost__Buttons__Left">
              <button 
                className={`TbdNewPost__Button ${highlightbuttonClass}`}
                onClick={onClickHighlightButton}
              />
              <button 
                className={`TbdNewPost__Button TbdNewPost__Buttons__AddReference`}
              />
            </div>
            <div className="TbdNewPost__Buttons__Right">
              <button className="TbdNewPost__Button" onClick={onClickSubmitButton}>Post</button>
            </div>
          </div>
        </div>
      </div>
           {/* <TextArea 
        placeholder="The pen is mightier than the sword."
        autoSize={{ minRows: 4 }}
      />
      <Button 
        style={anchorButtonStyles}
        type="primary" 
        shape="circle" 
        onClick={clickAnchorButton}
      >
        A
      </Button>
      <Button 
        style={postButtonStyles}
        type="primary" 
        onClick={clickSubmitButton}
      >
        POST
      </Button> */}
    </div>
  );
}
