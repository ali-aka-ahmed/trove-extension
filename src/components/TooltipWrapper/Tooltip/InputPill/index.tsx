import React, { useEffect, useRef, useState } from 'react';

interface InputPillProps {
  
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
  }, [isInput])

  return (
    <>
      {isInput ? (
        <input className="TbdInputPill TbdInputPill--input" ref={inputRef} />
      ) : (
        <button className="TbdInputPill TbdInputPill--button" onClick={onClick}>+ Topic</button>
      )}
    </>
  );
}
