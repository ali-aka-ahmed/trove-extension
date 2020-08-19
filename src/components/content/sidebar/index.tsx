import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { users } from '../../../utils/data';
import { getScrollbarDx } from '../../../utils/measurements';
import Bubble from './bubble';

export default function Sidebar() {
  const SIDEBAR_WIDTH = 50;
  const SIDEBAR_MARGIN = 15;
  const SIDEBAR_MARGIN_Y = 100;
  const BUBBLE_HEIGHT = 50;
  const BUBBLE_MARGIN = 7;
  
  const [position, setPosition] = useState({ x: SIDEBAR_MARGIN, y: SIDEBAR_MARGIN_Y });
  const [isOpen, setIsOpen] = useState(true);

  // Get list of bubbles from dummy data
  const bubbles = users.map((sd) => <Bubble key={sd.id} user={sd} />);

  function getHeight() {
    if (bubbles.length === 0) return BUBBLE_HEIGHT;
    return (bubbles.length + 1) * BUBBLE_HEIGHT + (bubbles.length) * BUBBLE_MARGIN;
  }

  function onDragStart(event: DraggableEvent, data: DraggableData) {
    event.preventDefault();
    event.stopPropagation();
  }

  function onDrag(event: DraggableEvent, data: DraggableData) {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen(false);
    console.log(data.x, data.y, data.lastX, data.lastY)
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
      handle=".TbdSidebar__Handle"
      position={position}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragStop}
    >
      <div className="TbdSidebar">
        <div 
          className="TbdSidebar__Handle TbdSidebar__LogoBubble"
          onMouseDown={() => setIsOpen(true)}
        ></div>
        {isOpen && bubbles}
      </div>
    </Draggable>
  );
}
