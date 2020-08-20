import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { users } from '../../../utils/data';
import { getScrollbarDx } from '../../../utils/measurements';
import Bubble from './bubble';

export const SIDEBAR_WIDTH = 50;
export const SIDEBAR_MARGIN = 15;
export const SIDEBAR_MARGIN_Y = 100;
export const BUBBLE_HEIGHT = 50;
export const BUBBLE_MARGIN = 7;

export default function Sidebar() {
  const [position, setPosition] = useState({ x: SIDEBAR_MARGIN, y: SIDEBAR_MARGIN_Y });
  const [isOpen, setIsOpen] = useState(true);
  const [dragged, setDragged] = useState(false);

  // Get list of bubbles from dummy data
  const bubbles = users.map((sd) => <Bubble key={sd.id} user={sd} visible={isOpen} />);

  function getHeight() {
    if (bubbles.length === 0) return BUBBLE_HEIGHT;
    return (bubbles.length + 1) * BUBBLE_HEIGHT + (bubbles.length) * BUBBLE_MARGIN;
  }

  function onClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!dragged) {
      setIsOpen(true);
    }

    setDragged(false);
  }

  function onDragStart(event: DraggableEvent, data: DraggableData) {
    event.preventDefault();
    event.stopPropagation();
  }

  function onDrag(event: DraggableEvent, data: DraggableData) {
    event.preventDefault();
    event.stopPropagation();
    setDragged(true);
    setIsOpen(false);
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
          onClick={(e) => onClick(e)}
          style={{ marginBottom: isOpen ? `${BUBBLE_MARGIN}px` : '0' }}
        ></div>
        {bubbles}
      </div>
    </Draggable>
  );
}
