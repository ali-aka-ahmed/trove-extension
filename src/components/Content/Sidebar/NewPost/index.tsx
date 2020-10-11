import { getSelection } from '@rangy/core';
import { serializeRange } from '@rangy/serializer';
import { Input } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import User from '../../../../entities/User';
import IUser from '../../../../models/IUser';
import { CreatePostReqBody } from '../../../../server/posts';
import { get } from '../../../../utils/chrome/storage';
import { sendMessageToExtension } from '../../../../utils/chrome/tabs';
import Highlighter from '../../helpers/Highlighter';

const MAX_USERNAME_LENGTH = 20;
const MAX_POST_LENGTH = 180;
const { TextArea } = Input;

interface NewPostProps {
  highlighter: Highlighter;
  setIsComposing: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
}

export default function NewPost(props: NewPostProps) {
  const [content, setContent] = useState('');
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [post, setPost] = useState({} as CreatePostReqBody);
  const [suggestedUsers, setSuggestedUsers] = useState([] as IUser[]);
  const [suggestedUsersIdx, setSuggestedUsersIdx] = useState(0);
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

  const submit = useCallback(async () => {
    // TODO: compute tagged users (this should prob happen in an onChange fn)
    // TODO: make sure anchor was done on this url
    console.log('start submit')
    if (!canSubmit()) return;
    setPost({
      ...post,
      url: window.location.href
    });
    console.log('submitting...', post)
    const success = await sendMessageToExtension({ type: 'createPost', post })
      .catch(err => console.error(err));
    console.log(success);

    props.setIsComposing(false);
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

  const onBlurContent = () => {
    setSuggestedUsers([]);
    setSuggestedUsersIdx(0);
  }

  /**
   * Get current word cursor is in and return all users who have usernames for which the given 
   * word is a prefix for.
   * @param ta 
   */
  const getSuggestedUsers = async (ta: HTMLTextAreaElement) => {
    if (ta.selectionStart !== ta.selectionEnd) return null;

    // Find start
    let startIdx = Math.max(Math.min(ta.selectionStart - 1, ta.value.length - 1), 0);
    while (startIdx > 0) {
      if (ta.value[startIdx].match(/\s/)) {
        startIdx++;
        break;
      }

      startIdx--;
    }
    
    // Find end
    let endIdx = Math.max(ta.selectionStart, 0);
    while (endIdx < ta.value.length) {
      if (ta.value[endIdx].match(/\s/)) break;
      endIdx++;
    }

    // Get word text cursor is in
    const handle = ta.value.slice(startIdx, endIdx);

    // Determine if it is a handle
    const match = handle.match(/^@[a-zA-Z0-9_]{1,20}/);
    let users: IUser[];
    if (match) {
      const prefix = match[0].slice(1);
      try {
        // Get users with usernames starting with this prefix
        users = await sendMessageToExtension({
          type: 'handleUsernameSearch', 
          name: prefix 
        }) as IUser[];
        setTagBounds({ start: startIdx, end: startIdx + match[0].length });
      } catch (err) {
        users = [];
      }
      
      setSuggestedUsers(users);
    } else {
      setSuggestedUsers([]);
    }
  }

  /**
   * Update textarea and hide/show suggested users dropdown appropriately.
   * @param e 
   */
  const onChangeContent = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setPost({...post, content: target.value});
    setContent(target.value);
    await getSuggestedUsers(target);      
  }

  /**
   * Hide/show suggested users dropdown appropriately.
   * @param e 
   */
  const onClickContent = async (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
    await getSuggestedUsers(e.target as HTMLTextAreaElement);
  }

  /**
   * Handle actions triggered by specific keystrokes in textarea. Currently used to navigate 
   * autocomplete dropdown with keyboard.
   */
  const onKeyDownContent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    const showSuggestedUsers = suggestedUsers.length > 0;
    switch (e.key) {
      case 'ArrowUp': {
        if (showSuggestedUsers) {
          e.preventDefault();
          setSuggestedUsersIdx(Math.max(0, suggestedUsersIdx - 1));
        }

        break;
      }
      case 'ArrowDown': {
        if (showSuggestedUsers) {
          e.preventDefault();
          const newIdx = Math.min(suggestedUsers.length - 1, suggestedUsersIdx + 1);
          setSuggestedUsersIdx(newIdx);
        }

        break;
      }
      case 'Enter': 
      case 'Tab': {
        if (showSuggestedUsers) {
          e.preventDefault();
          tagUser(suggestedUsers[suggestedUsersIdx]);
        }

        break;
      }
      case 'Escape': {
        if (showSuggestedUsers) {
          e.preventDefault();
          setSuggestedUsers([]);
          setSuggestedUsersIdx(0);
        }

        break;
      }
    }
  }

  /**
   * Get selection and save it as a highlight. Seems like text within our content script is
   * excluded from highlightable text by default because it sits inside a shadow DOM and therefore
   * has a different parent document.
   */
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
        taggedUserIds: []
      });
    });
  }, []);

  /**
   * Autocomplete current user handle and add user to taggedUserIds.
   * @param user 
   */
  const tagUser = (user: IUser) => {
    // Autocomplete username
    const newContent = content.slice(0, tagBounds.start) 
      + `@${user.username} ` 
      + content.slice(tagBounds.end);
    setContent(newContent);

    // Add user id to taggedUserIds and update post
    if (!post.taggedUserIds!.some(id => id === user.id)) {
      const taggedUserIdsCopy = post.taggedUserIds!.slice(0);
      taggedUserIdsCopy.push(user.id);
      setPost({ ...post, content: newContent, taggedUserIds: taggedUserIdsCopy });
    }
    
    // TODO: NOT WORKING (move cursor to appropriate location)
    contentRef.current.focus();
    // console.log(contentRef.current.resizableTextArea.textArea.selectionStart)
    contentRef.current.resizableTextArea.textArea.selectionStart = 0;
    contentRef.current.resizableTextArea.textArea.selectionEnd = 0;
    // contentRef.current.resizableTextArea.textArea.setSelectionRange(0, 0);
    // console.log(contentRef.current.resizableTextArea.textArea.selectionStart)
    // console.log(contentRef.current)

    // Reset state
    setTagBounds({ start: 0, end: 0 });
    setSuggestedUsers([]);
    setSuggestedUsersIdx(0);
  }

  /**
   * Render suggested users dropdown.
   */
  const renderSuggestedUsers = () => {
    return suggestedUsers.map((user, idx) => {
      const suggestedUserSelectedClass = (idx === suggestedUsersIdx)
        ? 'TbdSuggestedUsers__SuggestedUser--selected' 
        : '';
      return (
        <button 
          className={`TbdSuggestedUsers__SuggestedUser ${suggestedUserSelectedClass}`}
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
      );
    });
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
            onBlur={onBlurContent}
            onChange={onChangeContent}
            onClick={onClickContent}
            onKeyDown={onKeyDownContent}
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
