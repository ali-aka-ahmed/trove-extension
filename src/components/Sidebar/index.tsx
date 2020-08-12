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

  function onDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setPosition(new Point(e.clientX - offset.x, e.clientY - offset.y));
    setIsDragging(true);
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) {
      setOffset(new Point(e.clientX - position.x, e.clientY - position.y));
      
    }
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
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
    >
      {bubbles}
    </div>
  );
}
