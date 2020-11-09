import classNames from 'classnames';
import Color from 'color';
import React from 'react';

interface PillProps {
  color?: string;
  text?: string;
  onClose: () => void;
}

export default function Pill(props: PillProps) {
  return (
    <div 
      className="TbdPill"
      style={{ backgroundColor: props.color }}
    >
      <div 
        className="TbdPill__Text"
        style={{ color: Color(props.color).isLight() ? 'black' : 'white' }}
      >
        {props.text}
      </div>
      <button 
        className={classNames('TbdPill__CloseButton', {
          'TbdPill__CloseButton--inverted': Color(props.color).isLight()
        })} 
        onClick={props.onClose}
      />
    </div>
  );
}
