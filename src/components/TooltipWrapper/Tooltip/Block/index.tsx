import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

interface BlockProps {
  defaultValue?: string;
  onChange: (text: string) => void;
  removeBlock: () => void;
  highlightText: string;
}

const Block = ({ highlightText, defaultValue, onChange, removeBlock }: BlockProps) => {
  const [inputValue, setInputValue] = useState(defaultValue || '');
  const [isActive, setIsActive] = useState(true); // was false
  // const [isBlockHovered, setIsBlockHovered] = useState(false);

  useEffect(() => {
    if (defaultValue) setInputValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Backspace' && inputValue === '') {
      e.preventDefault();
      // setIsActive(false);
      removeBlock();
    }
  };

  return (
    <div
      className="TroveBlock"
      style={{
        // ...(!isActive && isBlockHovered ? { backgroundColor: '#EEEEEE' } : {}),
        ...(!isActive ? { padding: '3px 0' } : { padding: '2px 0' }),
      }}
      // onClick={() => {
      //   if (!isActive) setIsActive(true);
      // }}
      // onMouseEnter={() => setIsBlockHovered(true)}
      // onMouseLeave={() => setIsBlockHovered(false)}
    >
      {/* {isActive ? ( */}
      <TextareaAutosize
        className="TroveBlock__TextArea"
        onChange={handleChange}
        value={inputValue}
        onKeyDown={onKeyDown}
        placeholder={'Write something...'}
        autoFocus
      />
      {/* ) : (
        <div className="TroveBlock__EmptyBlock">
          {isBlockHovered && <div className="TroveBlock__AddButton">+</div>}
        </div>
      )} */}
    </div>
  );
};

export default Block;
