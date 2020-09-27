import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import React from 'react';
import { Post } from '../../../../models';

interface PostProps {
  post: Post;
}

export default function Post(props: PostProps) {
  const getContent = () => {
    // TODO: color tagged handles appropriately
    return (
      <div className="TbdPost__Content">
        {props.post.content}
      </div>
    );
  }

  const getTimeAgo = () => {
    console.log(Date.now())
    TimeAgo.addLocale(en);
    const timeAgo = new TimeAgo('en-US');
    return timeAgo.format(props.post.creationDatetime, 'twitter');
  }

  return (
    <div className="TbdPost">
      <div className="TbdPost__Left">
        <div 
          className="TbdPost__UserBubble" 
          style={{ backgroundColor: props.post.creator.color }}
        >
          {props.post.creator.username[0]}
        </div>
      </div>
      <div className="TbdPost__Right">
        <div className="TbdPost__Header">
          <p className="TbdPost__Header__DisplayName">
            {props.post.creator.displayName}
          </p>
          <p 
            className="TbdPost__Header__Username"
            style={{ color: props.post.creator.color }}
          >
            {`@${props.post.creator.username}`}
          </p>
          <p className="TbdPost__Header__Datetime">{getTimeAgo()}</p>
        </div>
        {getContent()}
        <div className="TbdPost__Buttons">
          {/* only comment button for now */}
        </div>
      </div>
    </div>
  );
}
