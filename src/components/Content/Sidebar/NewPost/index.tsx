import { getSelection } from '@rangy/core';
import { serializeRange } from '@rangy/serializer';
import { Input } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import User from '../../../../entities/User';
import IUser from '../../../../models/IUser';
import { createPost, CreatePostReqBody } from '../../../../server/posts';
import { handleUsernameSearch } from '../../../../server/users';
import { get } from '../../../../utils/chrome/storage';
import Highlighter from '../../helpers/Highlighter';

const MAX_USERNAME_LENGTH = 20;
const MAX_POST_LENGTH = 180;
const { TextArea } = Input;

interface NewPostProps {
  highlighter: Highlighter;
  user: User;
}

export default function NewPost(props: NewPostProps) {
  const [content, setContent] = useState('');
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [post, setPost] = useState({} as CreatePostReqBody);
  const [suggestedUsers, setSuggestedUsers] = useState([] as IUser[]);
  const [tagBounds, setTagBounds] = useState({ start: 0, end: 0 });
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
    createPost(post);
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

  const onChangeContent = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setPost({...post, content: target.value});
    setContent(target.value);
console.log(contentRef.current.resizableTextArea.textArea.selectionStart)
    // Get word text cursor is in
    if (target.selectionStart === target.selectionEnd) {
      // Find start
      let startIdx = Math.max(Math.min(target.selectionStart - 1, target.value.length - 1), 0);
      while (startIdx > 0) {
        if (target.value[startIdx].match(/\s/)) {
          startIdx++;
          break;
        }

        startIdx--;
      }
      
      // Find end
      let endIdx = Math.max(target.selectionStart, 0);
      while (endIdx < target.value.length) {
        if (target.value[endIdx].match(/\s/)) break;
        endIdx++;
      }

      // Get current word and determine if it is a handle
      let currWord = target.value.slice(startIdx, endIdx);
      const match = currWord.match(/^@[a-zA-Z0-9_]{1,20}/);
      let users: IUser[];
      if (match) {
        const handle = match[0].slice(1);
        try {
          console.log('searching...')
          users = (await handleUsernameSearch(handle)).users;
          setTagBounds({ start: startIdx, end: startIdx + match[0].length });
        } catch (err) {
          users = [];
        }
        
        setSuggestedUsers(users);
      } else {
        setSuggestedUsers([]);
      }
    }

    console.log('onchange finish')
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
    // if (contentRef.current) contentRef.current.focus();

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

  const tagUser = (user: IUser) => {
    const newContent = content.slice(0, tagBounds.start) 
      + `@${user.username} ` 
      + content.slice(tagBounds.end);
    setContent(newContent);

    // TODO: NOT WORKING (move cursor to appropriate location)
    contentRef.current.focus();
    // console.log(contentRef.current.resizableTextArea.textArea.selectionStart)
    // contentRef.current.resizableTextArea.textArea.selectionStart = 0;
    // contentRef.current.resizableTextArea.textArea.selectionEnd = 0;
    // contentRef.current.resizableTextArea.textArea.setSelectionRange(0, 0);
    // console.log(contentRef.current.resizableTextArea.textArea.selectionStart)
    // console.log(contentRef.current)
    setTagBounds({ start: 0, end: 0 });
    setSuggestedUsers([]);
  }

  const renderSuggestedUsers = () => {
    return suggestedUsers.map((user) => (
      <button 
        className="TbdSuggestedUsers__SuggestedUser"
        key={user.id}
        onClick={() => tagUser(user)}
      >
        <div className="TbdSuggestedUser__Left">
          <div 
            className="TbdSuggestedUser__UserBubble" 
            style={{ backgroundColor: user.color }}
          >
            {user.username[0]}
          </div>
        </div>
        <div className="TbdSuggestedUser__Right">
          <p className="TbdSuggestedUser__DisplayName">
            {user.displayName}
          </p>
          <p 
            className="TbdSuggestedUser__Username"
            style={{ color: user.color }}
          >
            {`@${user.username}`}
          </p>
        </div>
      </button>
    ));
  }

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
            value={content}
            ref={contentRef}
          />
          {suggestedUsers.length > 0 && (
            <div className="TbdNewPost__SuggestedUsers">
              {renderSuggestedUsers()}
            </div>
          )}
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
