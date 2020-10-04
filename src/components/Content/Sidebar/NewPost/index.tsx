import { Input } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import Post from '../../../../entities/Post';
import User from '../../../../entities/User';
import { APP_COLOR, ERROR_COLOR } from '../../../../styles/constants';
import { get } from '../../../../utils/chrome/storage';

const MAX_POST_LENGTH = 280;
const { TextArea } = Input;

interface NewPostProps {
  user: User;
}

export default function NewPost(props: NewPostProps) {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const [post, setPost] = useState({} as Partial<Post>);
  const contentRef = useRef<any>(null);

  const canSubmit = useCallback(() => {
    const cantSubmit = !post.highlight 
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
  
  const onClickAnchorButton = (e) => {
    console.log("HELP")
    setIsAnchored(false);
    setIsAnchoring(true);
  }

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

  // useEffect(() => {
  //   if (isAnchoring) {
  //     document.addEventListener('click', onClickPage);
  //   } else {
  //     document.removeEventListener('click', onClickPage);
  //   }

  //   return () => { document.removeEventListener('click', onClickPage); };
  // }, [isAnchoring, onClickPage]);

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
      };
      setPost(newPost);
    });
  }, []);

  // const mainReference = post.mainReference ? `Referencing ""` : 'Click to add reference';

  // Styles
  const anchorButtonStyles = useMemo(() => ({
    backgroundColor: isAnchored ? APP_COLOR : ERROR_COLOR
  }), [isAnchored]);

  const postButtonStyles = useMemo(() => ({
    backgroundColor: APP_COLOR
  }), []);

  return (
    <div className="TbdNewPost">
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
        <div className="TbdNewPost__MainReference">
          {}
        </div>
        <TextArea 
          className="TbdNewPost__Content"
          placeholder="The pen is mightier than the sword."
          autoSize={{ minRows: 2 }}
          ref={contentRef}
        />
        <div className="TbdNewPost__Buttons">
          <button className="TbdNewPost__Buttons__Submit" onClick={onClickSubmitButton}>Post</button>
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
