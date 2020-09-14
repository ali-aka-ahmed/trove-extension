import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Post } from '../../../../models';
import { get } from '../../../../utils/chrome/storage';
import { getAnchor } from '../../helpers/anchor';

const MAX_POST_LENGTH = 280;

export default function NewPost() {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [post, setPost] = useState({} as Partial<Post>);

  const canSubmit = useCallback(() => {
    const cantSubmit = !post.anchor 
      || !post.content 
      || post.content.length === 0
      || post.content.length > MAX_POST_LENGTH;
    return !cantSubmit;
  }, [post]);

  const submit = useCallback(() => {
    // TODO: compute tagged users
    // TODO: make sure anchor was done on this url
    setPost({
      ...post,
      url: '',
      creationDatetime: Date.now()
    });
  }, [post]);
  
  const clickAnchorButton = (e) => {
    console.log("HELP")
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
    
    setPost({
      ...post,
      anchor: getAnchor(e)
    });
    setIsAnchoring(false);
  }, [post]);

  useEffect(() => {
    if (isAnchoring) {
      document.addEventListener('click', onClickPage);
    } else {
      document.removeEventListener('click', onClickPage);
    }

    return () => { document.removeEventListener('click', onClickPage); };
  }, [isAnchoring, onClickPage]);

  useEffect(() => {
    get('user').then((items) => {
      setPost({ 
        ...post,
        id: uuid(),
        content: '',
        creator: items.user,
        creatorUserId: items.user.id
      });
    });
  }, []);

  return (
    <div className="TbdNewComment">
      <p className="TbdNewComment__Text">fake text</p>
      <Button 
        type="primary" 
        shape="circle" 
        onClick={clickAnchorButton}
      >
        A
      </Button>
      <Button type="primary" onClick={clickSubmitButton}>POST</Button>
    </div>
  );
}
