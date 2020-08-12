import React, { useCallback, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { users } from '../../data';
import Bubble from './bubble';
import './index.scss';
import Point from './Point';
import SidebarPosition from './SidebarPosition';

export default function Sidebar() {
  const [state, setState] = useState(SidebarPosition.Right);
  const [position, setPosition] = useState(new Point(0, 0));
  const [offset, setOffset] = useState(new Point(0, 0));
  const [isDragging, setIsDragging] = useState(false);

  const getClientXY = (e: React.MouseEvent | React.TouchEvent): Point => {
    const clientX = (e as React.TouchEvent).touches 
      ? (e as React.TouchEvent).touches[0].clientX
      : (e as React.MouseEvent).clientX;
    const clientY = (e as React.TouchEvent).touches 
      ? (e as React.TouchEvent).touches[0].clientY
      : (e as React.MouseEvent).clientY;
    return new Point(clientX, clientY);
  }

  function onDragStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const { x: clientX, y: clientY } = getClientXY(e);
    setPosition(new Point(clientX - offset.x, clientY - offset.y));
    setIsDragging(true);
  };

  const onDragTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) {
      setOffset(new Point(e.touches[0].clientX - position.x, e.touches[0].clientY - position.y));
    }
  };

  const onDragMouse = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) {
      setOffset(new Point(e.clientX - position.x, e.clientY - position.y));
    }  
  }, [isDragging, position]);

  const onDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setPosition(new Point(offset.x, offset.y));
    setIsDragging(false);
  };

  const getPositionClass = () => {
    switch (state) {
      case SidebarPosition.Right:
        return 'TbdSidebar--position-right';
      case SidebarPosition.Left:
        return 'TbdSidebar--position-left';
      case SidebarPosition.Bottom:
        return 'TbdSidebar--position-bottom';
      case SidebarPosition.Drag:
        return '';
    }
  }

  const bubbles = users.map((sd) => <Bubble key={sd.id} />);

  useEffect(() => {
    // Attach this listener to document so that if cursor leaves sidebar, drag action does not 
    // abruptly cease.
    document.addEventListener('mousemove', onDragMouse);
    return () => { document.removeEventListener('mousemove', onDragMouse); }
  }, [onDragMouse])

  // style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}

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
