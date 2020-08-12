import React, { useState } from 'react';
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

  const bubbles = users.map((sd) => <Bubble key={sd.id} />);

  // const getStyles = (): React.CSSProperties => {
  //   const a = DragLayerMonitoroffset, setOffset
  //   const transform = `translate(${x}px, ${y}px)`;
  //   return {
  //     transform,
  //     WebkitTransform: transform,
  //   };
  // }

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

  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) return;

    const { x: clientX, y: clientY } = getClientXY(e);
    setOffset(new Point(clientX - position.x, clientY - position.y));
  };

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

  return (
    <div
      className={`TbdSidebar ${getPositionClass()}`}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      onMouseDown={onDragStart}
      onMouseMove={onDrag}
      onMouseUp={onDragEnd}
      onTouchStart={onDragStart}
      onTouchMove={onDrag}
      onTouchEnd={onDragEnd}
    >
      {bubbles}
    </div>
  );
}
