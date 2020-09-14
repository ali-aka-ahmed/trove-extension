import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Post } from '../../../../models';
import { get } from '../../../../utils/chrome/storage';
import { getAnchor } from '../../helpers/anchor';

export default function NewPost() {
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [post, setPost] = useState({} as Partial<Post>);
  
  const handleClick = (e) => {
    console.log("HELP")
    setIsAnchoring(true);
  }

  const onClickPage = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.info('comment: clickpage');
    
    getAnchor(e);
  }, []);

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
    <div 
      className="TbdNewComment"
      onClick={handleClick} 
    >
      <p className="TbdNewComment__Text">fake text</p>
      <Button type="primary" shape="circle">A</Button>
    </div>
  );
}
