import { LoadingOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Post from '../../../../entities/Post';
import User from '../../../../entities/User';
import { ITopic } from '../../../../models/IPost';
import IUser from '../../../../models/IUser';
import { CreatePostReqBody, IPostRes } from '../../../../server/posts';
import { log } from '../../../../utils';
import { get } from '../../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../../utils/chrome/tabs';
import Highlighter, { HighlightType } from '../../helpers/highlight/Highlighter';
import { getXRangeFromRange } from '../../helpers/highlight/rangeUtils';

const { TextArea } = Input;

interface NewPostProps {
  highlighter: Highlighter;
  posts: Post[];
  replyingToPost: Post | null;
  setIsComposing: React.Dispatch<React.SetStateAction<boolean>>;
  setPosts: (posts: Post[]) => void;
  user: User;
}

export default function NewPost(props: NewPostProps) {
  const [content, setContent] = useState('');
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const [isHoveringSubmit, setIsHoveringSubmit] = useState(false);
  const [isMouseDownSuggestedTopic, setIsMouseDownSuggestedTopic] = useState(false);
  const [isMouseDownSuggestedUser, setIsMouseDownSuggestedUser] = useState(false);
  const [post, setPost] = useState({} as CreatePostReqBody);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [suggestedTopics, setSuggestedTopics] = useState([] as ITopic[]);
  const [suggestedTopicsIdx, setSuggestedTopicsIdx] = useState(0);
  const [suggestedUsers, setSuggestedUsers] = useState([] as IUser[]);
  const [suggestedUsersIdx, setSuggestedUsersIdx] = useState(0);
  const [userTagBounds, setUserTagBounds] = useState({ start: 0, end: 0 });
  const [loading, setLoading] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [tempId, setTempId] = useState('');
  const contentRef = useRef<any>(null);

  const canSubmit = useCallback(() => {
    const cantSubmit = !post.highlight
      || !post.content 
      || post.content.length === 0;
    return !cantSubmit;
  }, [post]);

  const getSubmitWarning = useCallback(() => {
    if (!post.highlight) {
      return "Must link post to highlight."
    } else if (!post.content || post.content.length === 0) {
      return "Post can't be empty.";
    } else if (submitErrorMessage) {
      // Probably don't want to show full error to user
      console.error(`Error submitting post. Error: ${submitErrorMessage}`);
      return 'Error submitting post. Please try again later.'
    }

    return null;
  }, [post]);

  const submit = useCallback(async () => {
    if (!canSubmit()) return;
    setLoading(true);

    // Create post or reply accordingly
    let promise: Promise<unknown>;
    const newPost = { ...post, url: window.location.href };
    if (props.replyingToPost) {
      promise = sendMessageToExtension({
        type: MessageType.CreateReply, 
        post: newPost, 
        id: props.replyingToPost.id 
      });
    } else {
      promise = sendMessageToExtension({ type: MessageType.CreatePost, post: newPost });
    }

    // Indicate post creation success/failure
    promise.then((res: IPostRes) => {
      if (res.success) {
        const newPosts = ([new Post(res.post!)]).concat(props.posts);
        props.setPosts(newPosts);
        props.setIsComposing(false);
      } else {
        setSubmitErrorMessage(res.message);
      }

      setLoading(false);
    });
  }, [canSubmit, post]);

  const onClickSubmit = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    log('onclick submit');

    submit();
  }, [submit]);

  const onMouseEnterSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    log('onmouseenter submit');

    setIsHoveringSubmit(true);
  }

  const onMouseLeaveSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    log('onmouseleave submit');

    setIsHoveringSubmit(false);
  }
  
  const onClickHighlightButton = useCallback((e) => {
    if (!isAnchoring) {
      setIsAnchored(false);
      props.highlighter.removeHighlight(tempId);
    } else {
      // Do nothing for now
    }

    setIsAnchoring(!isAnchoring);
  }, [isAnchoring, tempId]);

  useEffect(() => {
    if (isAnchoring) getNewSelection();
  }, [isAnchoring]);

  const onBlurContent = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    log('onblur content');
    
    if (!isMouseDownSuggestedUser) {
      setSuggestedUsers([]);
      setSuggestedUsersIdx(0);
    }
    
    if (!isMouseDownSuggestedTopic) {
      setSuggestedTopics([]);
      setSuggestedTopicsIdx(0);
    }
  }

  /**
   * Get current word cursor is in and return all users who have usernames for which the given 
   * word is a prefix for.
   * @param ta 
   */
  const suggestLinks = async (ta: HTMLTextAreaElement) => {
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
    const currWord = ta.value.slice(startIdx, endIdx);

    // Determine if it's a handle (starts with @)
    let match = currWord.match(/^@[a-zA-Z0-9_]{1,20}/);
    let users: IUser[];
    if (match) {
      // Create list of suggested users to tag
      const handlePrefix = match[0].slice(1);
      try {
        // Get users with usernames starting with this prefix
        users = await sendMessageToExtension({
          type: MessageType.HandleUsernameSearch, 
          name: handlePrefix 
        }) as IUser[];
        setUserTagBounds({ start: startIdx, end: startIdx + match[0].length });
      } catch (err) {
        console.error('Error occurred while getting list of suggested users. Error: ', err);
        users = [];
      }
      
      setSuggestedUsers(users);
    } else {
      setSuggestedUsers([]);
    }

    // Determine if it's a tag (starts with #)
    match = currWord.match(/^\#/);
    let topics: ITopic[];
    if (match) {
      const topicPrefix = match[0].slice(1);
      try {
        // Get users with usernames starting with this prefix
        topics = await sendMessageToExtension({
          type: MessageType.HandleTopicSearch, 
          topic: topicPrefix
        }) as ITopic[];
        setUserTagBounds({ start: startIdx, end: startIdx + match[0].length });
      } catch (err) {
        console.error('Error occurred while getting list of suggested topics. Error: ', err);
        topics = [];
      }

      const newTopic: ITopic = { text: currWord.slice(1), color: '#dddddd' };
      if (topics.some(topic => topic.text === newTopic.text)) {
        setShowCreateTopic(false);
      } else {
        topics.unshift(newTopic);
        setShowCreateTopic(true);
      }

      setSuggestedTopics(topics);
    } else {
      setSuggestedTopics([]);
    }
  }

  /**
   * Update textarea and hide/show suggested users dropdown appropriately.
   * @param e 
   */
  const onChangeContent = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { target } = e;
    setPost({ ...post, content: target.value });
    setContent(target.value);
    await suggestLinks(target);
  }

  /**
   * Hide/show suggested users dropdown appropriately.
   * @param e 
   */
  const onClickContent = async (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    log('onclick content');

    const target = e.target as HTMLTextAreaElement;
    await suggestLinks(target);
  }

  /**
   * Handle actions triggered by specific keystrokes in textarea. Currently used to navigate 
   * autocomplete dropdown with keyboard.
   */
  const onKeyDownContent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    const showSuggestedUsers = suggestedUsers.length > 0;
    const showSuggestedTags = suggestedTopics.length > 0;
    switch (e.key) {
      case 'ArrowUp': {
        if (showSuggestedUsers) {
          e.preventDefault();
          setSuggestedUsersIdx(Math.max(0, suggestedUsersIdx - 1));
        } else if (showSuggestedTags) {
          e.preventDefault();
          setSuggestedTopicsIdx(Math.max(0, suggestedTopicsIdx - 1));
        }
        break;
      }
      case 'ArrowDown': {
        if (showSuggestedUsers) {
          e.preventDefault();
          const newIdx = Math.min(suggestedUsers.length - 1, suggestedUsersIdx + 1);
          setSuggestedUsersIdx(newIdx);
        } else if (showSuggestedTags) {
          e.preventDefault();
          const newIdx = Math.min(suggestedTopics.length - 1, suggestedTopicsIdx + 1);
          setSuggestedTopicsIdx(newIdx);
        }

        break;
      }
      case 'Enter': 
      case 'Tab': {
        if (showSuggestedUsers) {
          e.preventDefault();
          tagUser(suggestedUsers[suggestedUsersIdx]);
        } else if (showSuggestedTags) {
          e.preventDefault();
          addTopic(suggestedTopics[suggestedTopicsIdx])
        }

        break;
      }
      case 'Escape': {
        if (showSuggestedUsers) {
          e.preventDefault();
          setSuggestedUsers([]);
          setSuggestedUsersIdx(0);
          setSuggestedTopics([]);
          setSuggestedTopicsIdx(0);
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
    if (selection && selection.toString()) {
      const range = selection.getRangeAt(0);

      // Serialize range here because adding highlight changes endContainer
      const xrange = getXRangeFromRange(range);
      props.highlighter.addHighlight(range, tempId, props.user.color, HighlightType.Default);
      setPost({
        ...post, 
        highlight: {
          context: selection.toString(),
          range: xrange,
          text: selection.toString(),
          url: window.location.href
        }
      });
      selection.removeAllRanges();
      setIsAnchoring(false);
    }
  }, [post, tempId]);

  useEffect(() => {
    if (isAnchoring) {
      document.addEventListener('mouseup', getNewSelection);
    } else {
      document.removeEventListener('mouseup', getNewSelection);
    }

    return () => { document.removeEventListener('mouseup', getNewSelection); };
  }, [isAnchoring, getNewSelection]);

  useEffect(() => {
    // Use temp id since ids are set in the backend
    const id = uuid();
    setTempId(id);

    // Get user to populate Post props
    // TODO: Get User in Sidebar and pass it in as a prop
    get('user').then((items) => {
      setPost({ 
        ...post,
        content: '',
        taggedUserIds: [],
        tags: []
      });

      // Highlight any selected text or, if none, put user in highighting mode
      setIsAnchoring(true);
    });

    return () => props.highlighter.removeHighlight(id);
  }, []);

  /**
   * Autocomplete current user handle and add user to taggedUserIds.
   * @param user 
   */
  const tagUser = (user: IUser) => {
    // Autocomplete username
    const newContent = content.slice(0, userTagBounds.start) 
      + `@${user.username} ` 
      + content.slice(userTagBounds.end);
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
    setUserTagBounds({ start: 0, end: 0 });
    setSuggestedUsers([]);
    setSuggestedUsersIdx(0);
  }

  const onClickSuggestedUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, user: User) => {
    e.preventDefault();
    e.stopPropagation();
    log('onclick suggesteduser');

    setIsMouseDownSuggestedUser(false);
    tagUser(user);
  }

  const onMouseDownSuggestedUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    log('onmousedown suggesteduser');

    // Becase mousedown fires before onblur, we can use this to subvert content onblur when 
    // user clicks on suggest users dropdown
    setIsMouseDownSuggestedUser(true);
  }

  const onMouseLeaveSuggestedUser = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    log('onmouseleave suggesteduser');

    // If user drags off of a suggested user after mousedown, the dropdown can't be closed by 
    // clicking outside of content because content is no longer focused and onblur is no longer
    // triggered. Therefore, we must focus content if the cursor leaves the suggested user entry.
    if (isMouseDownSuggestedUser) {
      contentRef.current.focus();
      setIsMouseDownSuggestedUser(false);
    }
  }

  /**
   * Autocomplete the tag and add it to tags.
   * @param tag 
   */
  const addTopic = (tag: ITopic) => {
    // Autocomplete the tag
    const newContent = content.slice(0, userTagBounds.start) 
    setContent(newContent);

    if (!post.tags!.some(t => t.text === tag.text)) {
      const topicsCopy = post.tags!.slice(0);
      topicsCopy.push(tag);
      setPost({ ...post, content: newContent, tags: topicsCopy });
    }

    // Reset state
    setSuggestedTopics([]);
    setSuggestedTopicsIdx(0);
  }

  const onClickSuggestedTopic = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>, 
    topic: ITopic
  ) => {
    e.preventDefault();
    e.stopPropagation();
    log('onclick tag');

    setIsMouseDownSuggestedTopic(false);
    addTopic(topic);
  }

  const onMouseDownSuggestedTopic = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    log('onmousedown suggestedtag');

    // Becase mousedown fires before onblur, we can use this to subvert content onblur when 
    // user clicks on suggest users dropdown
    setIsMouseDownSuggestedTopic(true);
  }

  const onMouseLeaveSuggestedTopic = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    log('onmouseleave suggestedtag');

    // If user drags off of a suggested user after mousedown, the dropdown can't be closed by 
    // clicking outside of content because content is no longer focused and onblur is no longer
    // triggered. Therefore, we must focus content if the cursor leaves the suggested user entry.
    if (isMouseDownSuggestedTopic) {
      contentRef.current.focus();
      setIsMouseDownSuggestedTopic(false);
    }
  }

  /**
   * Render suggested users dropdown.
   */
  const renderSuggestedUsers = () => {
    return suggestedUsers.map((user, idx) => {
      const suggestedUserSelectedClass = (idx === suggestedUsersIdx)
        ? 'TbdSuggestedUserList__SuggestedUser--selected' 
        : '';
      return (
        <button 
          className={`TbdSuggestedUserList__SuggestedUser ${suggestedUserSelectedClass}`}
          key={user.id}
          onClick={(e) => onClickSuggestedUser(e, user)}
          onMouseDown={onMouseDownSuggestedUser}
          onMouseLeave={onMouseLeaveSuggestedUser}
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

  /**
   * Render suggested users dropdown.
   */
  const renderSuggestedTopics = () => {
    return suggestedTopics.map((tag, idx) => {
      const suggestedTopicSelectedClass = (idx === suggestedTopicsIdx) 
        ? 'TbdSuggestedTopicList__SuggestedTopic--selected' 
        : '';
      return (
        <button
          className={`TbdSuggestedTopicList__SuggestedTopic ${suggestedTopicSelectedClass}`}
          key={tag.text}
          onClick={(e) => onClickSuggestedTopic(e, tag)}
          onMouseDown={onMouseDownSuggestedTopic}
          onMouseLeave={onMouseLeaveSuggestedTopic}
        >
          {idx === 0 && showCreateTopic && ( 
            <div className="TbdSuggestedTopicList__FirstTopic">
              Create:
            </div>
          )}
          <div
            className="TbdNewPost__TopicList"
            key={tag.text}
            style={{ backgroundColor: tag.color }}
          >
            <div className="TbdTopicList__Topic">{tag.text}</div>
          </div>
        </button>
      );
    });
  };

  // Classes
  const highlightActiveClass = isAnchoring ? 'TbdNewPost__Buttons__AddHighlight--active' : '';
  const highlightButtonClass = `TbdNewPost__Buttons__AddHighlight ${highlightActiveClass}`;
  const submitButtonDisabledClass = canSubmit() ? '' : 'TbdNewPost__Button--disabled';
  const submitButtonClass = `TbdNewPost__Buttons__Submit ${submitButtonDisabledClass}`;

  return (
    <>
      {props.replyingToPost?.creator && (
        <div>
          <p className="TbdNewPost__ReplyMessage">
            Replying to 
            <span style={{ color: props.replyingToPost.creator.color }}>
              {` @${props.replyingToPost.creator.username}`}
            </span>
            :
          </p>
        </div>
      )}
      <div className="TbdNewPost">
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
            {suggestedTopics.length > 0 && (
              <div className="TbdNewPost__SuggestedTopicList">
                {renderSuggestedTopics()}
              </div>
            )}
            {suggestedUsers.length > 0 && (
              <div className="TbdNewPost__SuggestedUserList">
                {renderSuggestedUsers()}
              </div>
            )}
            <div className="TbdNewPost__TopicList">
              {post.tags?.map((tag) => (
                <div
                  className="TbdTopicList__Topic"
                  key={tag.text}
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.text}
                </div>
              ))}
            </div>
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
                {!loading ? (
                  <button 
                    className={`TbdNewPost__Button ${submitButtonClass}`}
                    onClick={onClickSubmit}
                    onMouseEnter={onMouseEnterSubmit}
                    onMouseLeave={onMouseLeaveSubmit}
                  >
                    Post
                  </button>
                ) : (
                  <div className='TbdNewPost__Loading'><LoadingOutlined /></div>
                )}
              </div>
            </div>
          </div>
        </div>
        {((!canSubmit() && isHoveringSubmit) || submitErrorMessage) && (
          <div className="TbdNewPost__SubmitWarning">
            {getSubmitWarning()}
          </div>
        )}
      </div>
    </>
  );
}
