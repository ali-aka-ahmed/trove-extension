import { Tabs } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getScrollbarDx } from '../../../utils/measurements';
import Edge from './Edge';
import Point from './Point';

export const SIDEBAR_MARGIN = 15;
export const SIDEBAR_MARGIN_Y = 100;
export const BUBBLE_HEIGHT = 55;
export const BUBBLE_MARGIN = 20;
export const CONTENT_HEIGHT = 350;
export const CONTENT_WIDTH = 250;
export const EXIT_BUBBLE_WIDTH = 65;

export default function Sidebar() {
  const [position, setPosition] = useState(new Point(SIDEBAR_MARGIN, SIDEBAR_MARGIN_Y));
  const [offset, setOffset] = useState(new Point(0, 0));
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [closestEdge, setClosestEdge] = useState(Edge.Left);
  const bubbleRef = useRef(null);
  
  const getSidebarHeight = useCallback(() => {
    return isOpen ? BUBBLE_HEIGHT + BUBBLE_MARGIN + CONTENT_HEIGHT : BUBBLE_HEIGHT;
  }, [isOpen]);

  const getSidebarWidth = useCallback(() => {
    return isOpen ? CONTENT_WIDTH : BUBBLE_HEIGHT;
  }, [isOpen]);

  const anchorSidebar = useCallback(() => {
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
    } else { 
      const newX = width - BUBBLE_HEIGHT - SIDEBAR_MARGIN;
      setPosition(new Point(newX, newY));
      setClosestEdge(Edge.Right);
    }
  }, [position, getSidebarWidth, getSidebarHeight]);

  const snapToExitBubble = (e: MouseEvent | TouchEvent) => {
    const point = Point.fromEvent(e)
    
    // Get exit bubble point
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = (window.innerWidth - getScrollbarDx()) || document.documentElement.clientWidth;
    const exitCenter = new Point(width/2, height * 0.9 - EXIT_BUBBLE_WIDTH/2);

    // Snap to center of exit bubble if cursor is dragging logo bubble w/in a 40px radius
    if (point.getDistance(exitCenter) < 40) {
      return exitCenter.getOffset(new Point(BUBBLE_HEIGHT/2, BUBBLE_HEIGHT/2));
    }

    return null;
  }

  const onClickBubble = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.info('clickbubble')

    if (wasDragged) {
      // Click event firing after drag
      setWasDragged(false);
    } else {
      // Normal click
      setIsOpen(!isOpen);
    }
  }, [isOpen, wasDragged, anchorSidebar]);

  const onClickPage = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.info('clickpage')

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    (bubbleRef.current! as HTMLElement).dispatchEvent(event);
  }, [bubbleRef]);

  const onDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.info('ondragstart')

    setOffset(Point.fromEvent(e).getOffset(position));
    setIsDragging(true);
  }, [position]);

  const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.info('ondrag')
    
    if (isDragging) {
      setIsOpen(false);
      setWasDragged(true);

      // Snap to exit bubble if applicable
      setPosition(snapToExitBubble(e) || Point.fromEvent(e).getOffset(offset));
    }
  }, [isDragging, offset]);

  const onDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.info('ondragend')
    setIsDragging(false);

    // onClick isn't called after a drag if mouseup is beyond bounds of window 
    if (wasDragged) anchorSidebar();
  }, [offset, wasDragged, anchorSidebar]);

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

  useEffect(() => {
    if (wasDragged) {
      document.addEventListener('click', onClickPage);
    } else {
      document.removeEventListener('click', onClickPage);
    }

    return () => { document.removeEventListener('click', onClickPage); }
  }, [wasDragged, onClickPage]);

  useEffect(() => {
    anchorSidebar();
  }, [isOpen])

  // Determine class denoting position of sidebar components
  const positionText = closestEdge === Edge.Left ? 'left' : 'right';
  const contentPositionClass = `TbdSidebar__MainContent--position-${positionText}`;

  const sidebarStyles = useMemo(() => ({
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging ? 'none' : 'transform 150ms'
  }), [isDragging, position]);

  const logoBubbleStyles = useMemo(() => ({
    cursor: wasDragged ? 'move' : 'pointer',
    marginBottom: `${isOpen ? BUBBLE_MARGIN : 0}px`
  }), [isOpen, wasDragged]);

  const contentStyles = useMemo(() => {
    const transform = (closestEdge === Edge.Right && isOpen)
      ? `translate(${-CONTENT_WIDTH + BUBBLE_HEIGHT}px, 0px)`
      : 'translate(0px, 0px)';
    return { transform }; 
  }, [closestEdge, isOpen]);

  return (
    <>
      <div 
        className="TbdSidebar"
        style={sidebarStyles}
      >
        <div
          className="TbdSidebar__LogoBubble"
          onClick={onClickBubble}
          onMouseDown={onDragStart}
          ref={bubbleRef}
          style={logoBubbleStyles}
        >
        </div>
        {isOpen && (
          <div 
            className={`TbdSidebar__MainContent ${contentPositionClass}`}
            style={contentStyles}
          >
            <Tabs defaultActiveKey="1">
              <Tabs.TabPane tab="comments" key="1">
                
              </Tabs.TabPane>
            </Tabs>
          </div>
        )}
      </div>
      {wasDragged && (
        <div className="TbdExitBubble"></div>
      )}
    </>
  );
}
