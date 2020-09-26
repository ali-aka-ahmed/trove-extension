import { Button, Input } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Post } from '../../../../models';
import { APP_COLOR, ERROR_COLOR } from '../../../../styles/constants';
import { get } from '../../../../utils/chrome/storage';
import Anchor from "../../helpers/Anchor";

const MAX_POST_LENGTH = 280;
const { TextArea } = Input;

interface NewPostProps {
  anchor?: Anchor;
}

export default function NewPost(props: NewPostProps) {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [isAnchored, setIsAnchored] = useState(false);
  const [post, setPost] = useState({} as Partial<Post>);

  const canSubmit = useCallback(() => {
    const cantSubmit = !post.anchor 
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
  
  const clickAnchorButton = (e) => {
    console.log("HELP")
    setIsAnchored(false);
    setIsAnchoring(true);
  }

  const clickSubmitButton = useCallback((e) => {
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
    get('user').then((items) => {
      const newPost = { 
        ...post,
        id: uuid(),
        content: '',
        creator: items.user,
        creatorUserId: items.user.id
      };
      if (props.anchor) newPost.anchor = props.anchor;
      setPost(newPost);
    });
  }, []);

  // Styles
  const anchorButtonStyles = useMemo(() => ({
    backgroundColor: isAnchored ? APP_COLOR : ERROR_COLOR
  }), [isAnchored]);

  const postButtonStyles = useMemo(() => ({
    backgroundColor: APP_COLOR
  }), []);

  return (
    <div className="TbdNewPost">
      <TextArea 
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
      </Button>
    </div>
  );
}
