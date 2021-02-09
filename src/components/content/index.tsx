import React, { forwardRef } from 'react';
import { ORIGIN } from '../../config/config.dev';
import User from '../../models/IUser';
import { MessageType, sendMessageToExtension } from '../../utils/chrome/tabs';
import './index.scss';

interface ContentProps {
  value: string;
  taggedUsers: User[];
  className?: string;
  style?: object;
}

export type ContentRef = HTMLDivElement | null;

const Content = forwardRef<ContentRef, ContentProps>(({
  value,
  taggedUsers,
  className,
  style={},
}, ref) => {

  const handleClickUserTag = async (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, username: string) => {
    e.stopPropagation();
    await sendMessageToExtension({ type: MessageType.OpenTab, url: `${ORIGIN}/${username}` });
  }

  const renderContentWithTags = (content: string, taggedUsers: User[]) => {
    let tokenizedContent: string[] = [];
    if (!taggedUsers || taggedUsers.length === 0) {
      tokenizedContent = [content];
    } else {
      const regex = new RegExp(`(${taggedUsers?.map(user => `@${user.username}`).join('|')})`);
      tokenizedContent = content.split(regex).filter(str => !!str);
    }
    const isUsername = (str: string): boolean => str[0] === '@';
    const getUserColor = (str: string): string | undefined => {
      return taggedUsers?.find(user => user.username === str.slice(1))?.color; 
    }
    const getUsername = (str: string): string => str.slice(1);

    return (
      <>
        {tokenizedContent.map((subString, i) => {
          return isUsername(subString) ? (
            <span
              className="TroveContent__Substring TroveContent__UserLink"
              key={i}
              style={{
                color: getUserColor(subString),
                textDecorationColor: getUserColor(subString)
              }}
              onClick={(e) => handleClickUserTag(e, getUsername(subString))}
            >
              {subString}
            </span>
          ) : (
            <span key={i} className="TroveContent__Substring">{subString}</span>
          )
        })}
      </>
    )
  };

  return (
    <div
      className={`TroveExtension__EditorContent ${className}`}
      ref={ref}
      style={style}
    >
      {renderContentWithTags(value, taggedUsers)}
    </div>
  );
});

export default Content;
