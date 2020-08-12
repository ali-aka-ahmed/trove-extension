import React from 'react';
import Draggable from 'react-draggable';
import { users } from '../../data';
import Bubble from './bubble';
import './index.scss';

export default function Sidebar() {
  const bubbles = users.map((sd) => <Bubble key={sd.id} />);

  return (
    <Draggable
      handle=".TbdBubble"
      defaultPosition={{x: 0, y: 0}}
    >
      <div className={`TbdSidebar`}>
        {bubbles}
      </div>
    </Draggable>
  );
}
