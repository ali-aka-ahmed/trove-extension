import React, { useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { users } from '../../data';
import { getScrollbarDx } from '../../utils/measurements';
import Bubble from './bubble';
import './index.scss';

export default function Sidebar() {
  const SIDEBAR_WIDTH = 50;
  const SIDEBAR_MARGIN = 15;
  const BUBBLE_HEIGHT = 50;
  
  const [position, setPosition] = useState({ x: SIDEBAR_MARGIN, y: SIDEBAR_MARGIN });

  // Get list of bubbles from dummy data
  const bubbles = users.map((sd) => <Bubble key={sd.id} user={sd} />);

  /**
   * Return sidebar to closest edge of screen after being dragged.
   * @param event 
   * @param data 
   */
  function onDragStop(event: DraggableEvent, data: DraggableData) { console.log('hi')
    // Calc screen bounds
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = window.innerWidth || document.documentElement.clientWidth;

    // Calc distance to each edge
    const leftDx = data.x - 0;
    const rightDx = width - (data.x + SIDEBAR_WIDTH);

    // Set new position on closest edge
    const minY = SIDEBAR_MARGIN;
    const maxY = height - bubbles.length * BUBBLE_HEIGHT - SIDEBAR_MARGIN;
    const newY = Math.min(Math.max(minY, data.y), maxY);
    if (leftDx < rightDx) {
      setPosition({ x: SIDEBAR_MARGIN, y: newY });
    } else {
      const newX = width - SIDEBAR_WIDTH - SIDEBAR_MARGIN - getScrollbarDx();
      setPosition({ x: newX, y: newY });
    }
  };

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
