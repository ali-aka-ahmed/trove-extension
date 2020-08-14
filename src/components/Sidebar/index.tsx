import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { users } from '../../data';
import Bubble from './bubble';
import './index.scss';

export default function Sidebar() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const SIDEBAR_WIDTH = 50;

  const onDragStop = (event: DraggableEvent, data: DraggableData) => {
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = window.innerWidth || document.documentElement.clientWidth;

    const leftDx = data.x - 0;
    const rightDx = width - (data.x + SIDEBAR_WIDTH);

    if (leftDx < rightDx) {
      setPosition({ x: 0, y: data.y });
    } else {
      setPosition({ x: width - SIDEBAR_WIDTH, y: data.y });
    }
  };
  
  const bubbles = users.map((sd) => <Bubble key={sd.id} />);

  return (
    <Draggable
      handle=".TbdBubble"
      position={position}
      onStop={onDragStop}
    >
      <div className="TbdSidebar">
        {bubbles}
      </div>
    </Draggable>
  );
}
