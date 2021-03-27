import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { MARK_CLASS_NAME } from '../helpers/highlight/domHighlight';
import Highlighter, { HighlightType, UnsavedHighlight } from '../helpers/highlight/Highlighter';

interface HighlightProps {
  highlight: UnsavedHighlight;
  root: ShadowRoot;
  scrollToElement: (id: string) => void;
  removeHighlight: (id: string) => void;
  modifyHighlightContent: (id: string, newContent: string) => void;
}

const Highlight = ({
  highlight,
  removeHighlight,
  modifyHighlightContent,
  scrollToElement,
  root,
}: HighlightProps) => {
  const [commentValue, setCommentValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const elem = root.getElementById(`${highlight.data.id}Block`);
    if (elem) {
      const heightFromBottom = window.innerHeight - elem.getBoundingClientRect().y;
      if (heightFromBottom < 80) {
        scrollToElement(`${highlight.data.id}Block`);
      }
    }
  }, [hasContent]);

  useEffect(() => {
    if (!highlight.content) {
      setHasContent(false);
    } else if (highlight.content) {
      setHasContent(true);
      setCommentValue(highlight.content);
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
    modifyHighlightContent(highlight.data.id, e.target.value); // modifies actual data
    setCommentValue(e.target.value); // modifies local input. without this the above doesn't trigger a change.
  };

  return (
    <div className="TroveHighlightWrapper" style={hasContent ? { marginBottom: '0' } : {}}>
      <div
        className="TroveHighlight"
        onMouseEnter={() => setIsHovered(true)}
        onMouseOver={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <mark
          className={MARK_CLASS_NAME}
          style={{
            backgroundColor: Highlighter.getColor(highlight.data.color, HighlightType.Default),
            userSelect: 'none',
          }}
        >
          {highlight.data.textRange.text}
        </mark>
        {isHovered && (
          <div className="TroveHighlight__ButtonWrapper">
            {!hasContent && (
              <button
                className="TroveHighlight__OptionButton"
                onClick={() => {
                  setHasContent(true);
                  setIsHovered(false);
                }}
              >
                Add comment
              </button>
            )}
            <button
              className="TroveHighlight__OptionButton TroveHighlight__OptionButton--delete"
              onClick={() => removeHighlight(highlight.data.id)}
              style={!hasContent ? { marginLeft: '5px' } : {}}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {hasContent && (
        <div className="TroveBlock" id={`${highlight.data.id}Block`}>
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

export default Highlight;
