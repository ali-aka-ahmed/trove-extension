import Color from 'color';
import React, { useState } from 'react';

interface PillProps {
  color?: string;
  text?: string;
  onClose: () => void;
}

export default function Pill(props: PillProps) {
  const [isHovering, setIsHovering] = useState(false);

  const onMouseEnter = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsHovering(true);
  }

  const onMouseLeave = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsHovering(false);
  }

  return (
    <div 
      className="TbdPill"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ backgroundColor: props.color }}
    >
      <div 
        className="TbdPill__Text"
        style={{ color: Color(props.color).isLight() ? 'black' : 'white' }}
      >
        {props.text}
      </div>
      {isHovering && (
        <button className="TbdPill__CloseButton" onClick={props.onClose}></button>
      )}
    </div>
  );
}
