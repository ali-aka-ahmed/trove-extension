import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { analytics } from '../../../../utils/analytics';
import { Link } from '../helpers/highlight/Highlighter';

interface HighlightProps {
  link: Link;
  root: ShadowRoot;
  scrollToElement: (id: string) => void;
  removeLink: () => void;
  modifyLinkContent: (id: string, newContent: string) => void;
}

const Link = ({ link, removeLink, modifyLinkContent, scrollToElement, root }: HighlightProps) => {
  const [commentValue, setCommentValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const elem = root.getElementById(`${link.id}Block`);
    if (elem) {
      const heightFromBottom = window.innerHeight - elem.getBoundingClientRect().y;
      if (heightFromBottom < 80) {
        scrollToElement(`${link.id}Block`);
      }
    }
  }, [hasContent]);

  useEffect(() => {
    if (!link.content) {
      setHasContent(false);
    } else if (link.content) {
      setHasContent(true);
      setCommentValue(link.content);
    }
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Backspace' && commentValue === '') {
      e.preventDefault();
      setHasContent(false);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    modifyLinkContent(link.id, e.target.value); // modifies actual data
    setCommentValue(e.target.value); // modifies local input. without this the above doesn't trigger a change.
  };

  return (
    <div className="TroveHighlightWrapper" style={hasContent ? { marginBottom: '0' } : {}}>
      <div
        className="TroveLink"
        onMouseEnter={() => setIsHovered(true)}
        onMouseOver={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="TroveLink__Title">{link.title}</div>
        {isHovered && (
          <div className="TroveHighlight__ButtonWrapper">
            {!hasContent && (
              <button
                className="TroveHighlight__OptionButton"
                onClick={() => {
                  setHasContent(true);
                  setIsHovered(false);
                  analytics('Add Comment to Link', null, {
                    url: window.location.href,
                  });
                }}
              >
                Add comment
              </button>
            )}
            <button
              className="TroveHighlight__OptionButton TroveHighlight__OptionButton--delete"
              onClick={removeLink}
              style={!hasContent ? { marginLeft: '5px' } : {}}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {hasContent && (
        <div className="TroveBlock" id={`${link.id}Block`}>
          <TextareaAutosize
            className="TroveBlock__TextArea"
            onChange={handleCommentChange}
            value={commentValue}
            onKeyDown={onKeyDown}
            onKeyPress={(e) => e.stopPropagation()}
            placeholder={'Write something...'}
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default Link;
