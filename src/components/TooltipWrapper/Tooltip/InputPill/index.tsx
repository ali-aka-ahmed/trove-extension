import React, { useEffect, useRef, useState } from 'react';
import ITopic from '../../../../models/ITopic';

interface InputPillProps {
  onSubmit: (topic: Partial<ITopic>) => void;
}

export default function InputPill(props: InputPillProps) {
  const [isInput, setIsInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setIsInput(true);
  }

  useEffect(() => {
    if (isInput) {
      (inputRef.current as HTMLInputElement).focus();
    }
  }, [isInput]);

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = (e.target as HTMLInputElement).value.trim();
    console.log(val, val && val === '')
    if (val === '') setIsInput(false);
  }

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      props.onSubmit({
        color: '#ebebeb',
        text: (e.target as HTMLInputElement).value
      });

      (e.target as HTMLInputElement).value = '';
    } else if (e.key === 'Escape') {
      (e.target as HTMLInputElement).blur();
    } 
  }

  return (
    <>
      {isInput ? (
        <input 
          className="TbdInputPill TbdInputPill--input"
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          ref={inputRef} 
        />
      ) : (
        <button className="TbdInputPill TbdInputPill--button" onClick={onClick}>+ Topic</button>
      )}
    </>
  );
}
