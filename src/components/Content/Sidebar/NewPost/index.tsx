import { Button, Input } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Post } from '../../../../models';
import { get } from '../../../../utils/chrome/storage';
import { getAnchor } from '../../helpers/anchor';

const MAX_POST_LENGTH = 280;
const { TextArea } = Input;

export default function NewPost() {
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
    setPost({
      ...post,
      url: '',
      creationDatetime: Date.now()
    });
  }, [post]);
  
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
    
    setPost({
      ...post,
      anchor: getAnchor(e)
    });
    setIsAnchoring(false);
    setIsAnchored(true);
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

  // Styles
  const anchorStyles = useMemo(() => ({
    backgroundColor: post.creator?.color,
    transform: post.anchor ? `translate(${post.anchor.location.x}, ${post.anchor.location.y})` : 'none'
  }), [post.creator?.color, post.anchor?.location]);

  return (
    <div className="TbdNewPost">
      <TextArea 
        placeholder="The pen is mightier than the sword."
        autoSize={{ minRows: 4 }} 
      />
      <Button 
        type="primary" 
        shape="circle" 
        onClick={clickAnchorButton}
      >
        B
      </Button>
      <Button type="primary" onClick={clickSubmitButton}>POST</Button>
      {isAnchored && <div className="TbdNewPost__Anchor" style={anchorStyles}></div>}
    </div>
  );
}
