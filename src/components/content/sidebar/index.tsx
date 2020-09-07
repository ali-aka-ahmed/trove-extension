import { Tabs } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getScrollbarDx } from '../../../utils/measurements';
import Edge from './Edge';
import Point from './Point';

export const SIDEBAR_MARGIN = 15;
export const SIDEBAR_MARGIN_Y = 100;
export const BUBBLE_HEIGHT = 55;
export const BUBBLE_MARGIN = 20;
export const CONTENT_WIDTH = 300;

export default function Sidebar() {
  const [position, setPosition] = useState(new Point(SIDEBAR_MARGIN, SIDEBAR_MARGIN_Y));
  const [offset, setOffset] = useState(new Point(0, 0));
  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [closestEdge, setClosestEdge] = useState(Edge.Left);
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  const getSidebarHeight = () => {
    return BUBBLE_HEIGHT;
  }

  const getSidebarWidth = useCallback(() => {
    return isOpen ? CONTENT_WIDTH : BUBBLE_HEIGHT;
  }, [isOpen]);

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOffset(Point.fromEvent(e).getOffset(position));
    setIsDragging(true);
  }, [position]);

  const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) {
      setPosition(Point.fromEvent(e).getOffset(offset));
    }
  }, [isDragging, offset]);

  const onDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition(Point.fromEvent(e).getOffset(offset));
    setIsDragging(false);

    // Calc screen bounds
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = (window.innerWidth - getScrollbarDx()) || document.documentElement.clientWidth;

    // Calc distance to each edge
    const leftDx = position.x - 0;
    const rightDx = width - (position.x + getSidebarWidth());

    // Set new position on closest edge
    const minY = SIDEBAR_MARGIN;
    const maxY = height - getSidebarHeight() - SIDEBAR_MARGIN;
    const newY = Math.min(Math.max(minY, position.y), maxY);
    if (leftDx < rightDx) {
      setPosition(new Point(SIDEBAR_MARGIN, newY));
      setClosestEdge(Edge.Left);
    } else { console.log(isOpen, width, getSidebarWidth(), SIDEBAR_MARGIN)
      const newX = width - getSidebarWidth() - SIDEBAR_MARGIN;
      setPosition(new Point(newX, newY));
      setClosestEdge(Edge.Right);
    }
  }, [offset, position, getSidebarWidth]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', onDragEnd);
    } else {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onDragEnd);
    }

    return () => { 
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', onDragEnd);
    }
  }, [isDragging, onDrag, onDragEnd]);

  // Determine class denoting position of sidebar
  const positionClass = `TbdSidebar--position-${closestEdge === Edge.Left ? 'left' : 'right'}`;

  const sidebarStyles = useMemo(() => ({
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging ? 'none' : 'transform 150ms'
  }), [isDragging, position]);

  const logoBubbleStyles = useMemo(() => ({
    cursor: isMouseDown ? 'grabbing' : '-webkit-grab',
    marginBottom: `${isOpen ? BUBBLE_MARGIN : 0}px`
  }), [isOpen, isMouseDown]);

  return (
    <div 
      className={`TbdSidebar ${positionClass}`}
      style={sidebarStyles}
    >
      <div 
        className="TbdSidebar__LogoBubble"
        // onClick={(e) => onClick(e)}
        onMouseDown={(e) => onDragStart(e)}
        style={logoBubbleStyles}
      >
      </div>
      {isOpen && (
        <div className="TbdSidebar__MainContent">
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="notifications" key="1">
              
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
    </div>
  );
}


// const onClick = (event: React.MouseEvent) => {
//   event.preventDefault();
//   event.stopPropagation();
//   setDragged(false);
// }

// const onDragStart = (event: DraggableEvent, data: DraggableData) => {
//   event.preventDefault();
//   event.stopPropagation();
// }

// const onDrag = (event: DraggableEvent, data: DraggableData) => {
//   event.preventDefault();
//   event.stopPropagation();
//   setDragged(true);
//   setIsOpen(false);
// }

// /**
//  * Return sidebar to closest edge of screen after being dragged.
//  * @param event   
//  * @param data 
//  */
// const onDragStop = useCallback((event: DraggableEvent, data: DraggableData) => {
//   event.preventDefault();
//   event.stopPropagation();
// console.log(dragged, isOpen)
//   if (!dragged) {
//     const temp = !isOpen;
//     console.log(dragged, isOpen, temp)
//     setIsOpen(temp);
//   }
// console.log('ended', isOpen)
//   // Calc screen bounds
//   const height = window.innerHeight || document.documentElement.clientHeight;
//   const width = (window.innerWidth - getScrollbarDx()) || document.documentElement.clientWidth;

//   // Calc distance to each edge
//   const leftDx = data.x - 0;
//   const rightDx  = width - (data.x + getSidebarWidth());

//   // Set new position on closest edge
//   const minY = SIDEBAR_MARGIN;
//   const maxY = height - getSidebarHeight() - SIDEBAR_MARGIN;
//   const newY = Math.min(Math.max(minY, data.y), maxY);
//   if (leftDx < rightDx) {
//     setPosition({ x: SIDEBAR_MARGIN, y: newY });
//     setClosestEdge(Edge.Left);
//   } else { console.log(isOpen, width, getSidebarWidth(), SIDEBAR_MARGIN)
//     const newX = width - getSidebarWidth() - SIDEBAR_MARGIN;
//     setPosition({ x: newX, y: newY });
//     setClosestEdge(Edge.Right);
//   }
//   console.log('=======================')
// }, [getSidebarWidth, dragged, isOpen]);