import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { users } from '../../utils/data';
import { getScrollbarDx } from '../../utils/measurements';
import Bubble from './bubble';
// import './index.scss';

export default function Sidebar() {
  const SIDEBAR_WIDTH = 50;
  const SIDEBAR_MARGIN = 15;
  const BUBBLE_HEIGHT = 50;
  const BUBBLE_MARGIN = 10;
  
  const [position, setPosition] = useState({ x: SIDEBAR_MARGIN, y: SIDEBAR_MARGIN });

  // Get list of bubbles from dummy data
  const bubbles = users.map((sd) => <Bubble key={sd.id} user={sd} />);

  function getHeight() {
    if (bubbles.length === 0) return 0;
    return bubbles.length * BUBBLE_HEIGHT + (bubbles.length - 1) * BUBBLE_MARGIN;
  }

  function onDragStart(event: DraggableEvent, data: DraggableData) {
    event.preventDefault();
    event.stopPropagation();
  }

  function onDrag(event: DraggableEvent, data: DraggableData) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Return sidebar to closest edge of screen after being dragged.
   * @param event   
   * @param data 
   */
  function onDragStop(event: DraggableEvent, data: DraggableData) {
    event.preventDefault();
    event.stopPropagation();

    // Calc screen bounds
    console.log( window.innerHeight , document.documentElement.clientHeight, 
      window.innerWidth-getScrollbarDx() , document.documentElement.clientWidth)
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = (window.innerWidth - getScrollbarDx()) || document.documentElement.clientWidth;

    // Calc distance to each edge
    const leftDx = data.x - 0;
    const rightDx = width - (data.x + SIDEBAR_WIDTH);

    // Set new position on closest edge
    const minY = SIDEBAR_MARGIN;
    const maxY = height - getHeight() - SIDEBAR_MARGIN;
    const newY = Math.min(Math.max(minY, data.y), maxY);
    if (leftDx < rightDx) {
      setPosition({ x: SIDEBAR_MARGIN, y: newY });
    } else {
      const newX = width - SIDEBAR_WIDTH - SIDEBAR_MARGIN;
      setPosition({ x: newX, y: newY });
    }
  };

  return (
    <Draggable
      handle=".TbdBubble"
      position={position}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragStop}
    >
      <div className="TbdSidebar">
        {bubbles}
      </div>
    </Draggable>
  );
}
