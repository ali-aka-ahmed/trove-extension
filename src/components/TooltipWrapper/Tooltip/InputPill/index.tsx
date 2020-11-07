import React, { useState } from "react";

interface InputPillProps {
  
}

export default function InputPill(props: InputPillProps) {
  const [isInput, setIsInput] = useState(false);

  const onClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setIsInput(true);
  }

  return (
    <>
      {isInput ? (
        <input className="TbdInputPill TbdInputPill--input" />
      ) : (
        <button className="TbdInputPill TbdInputPill--button" onClick={onClick}>+ Topic</button>
      )}
    </>
  );
}
