import Color from 'color';
import React from 'react';
import { hexToRgba } from '../../../../utils';

interface PillProps {
  color: string;
  text: string;
  faded?: boolean;
  filter?: boolean;
  onClick?: () => void;
  onClose?: () => void;
  showClose?: boolean;
  style?: object;
}

export default function Pill({
  text,
  color,
  faded=false,
  filter=false,
  onClick=( () => {} ),
  onClose=( () => {} ),
  showClose=false,
  style={},
}: PillProps) {
  const customStyle = {
    ...style,
    backgroundColor: hexToRgba(color, faded ? 0.5 : 1) || '#DDDDDD'
  }

  return (
    <div
      className={`TbdPill ${filter ? 'TbdPill--filter' : ''}`}
      style={customStyle}
      onClick={onClick}
    >
      <div 
        className="TbdPill__Text"
        style={{ color: Color(color).isLight() ? 'black' : 'white' }}
      >
        {text}
      </div>
      {showClose && (
        <button 
          className={`TbdPill__CloseButton 
            ${Color(color).isLight() ? 'TbdPill__CloseButton--inverted' : ''}
          `}
          onClick={onClose}
        />
      )}
    </div>
  );
}
