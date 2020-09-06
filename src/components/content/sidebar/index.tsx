import { Tabs } from 'antd';
import React, { useCallback, useState } from 'react';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { getScrollbarDx } from '../../../utils/measurements';
import Edge from './Edge';

export const SIDEBAR_MARGIN = 15;
export const SIDEBAR_MARGIN_Y = 100;
export const BUBBLE_HEIGHT = 55;
export const BUBBLE_MARGIN = 20;
export const CONTENT_WIDTH = 300;

export default function Sidebar() {
  const [position, setPosition] = useState({ x: SIDEBAR_MARGIN, y: SIDEBAR_MARGIN_Y });
  const [isOpen, setIsOpen] = useState(false);
  const [dragged, setDragged] = useState(false);
  const [closestEdge, setClosestEdge] = useState(Edge.Left);

  const getSidebarHeight = () => {
    return BUBBLE_HEIGHT;
  }

  const getSidebarWidth = useCallback(() => {
    return isOpen ? CONTENT_WIDTH : BUBBLE_HEIGHT;
  }, [isOpen]);

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDragged(false);
  }

  const onDragStart = (event: DraggableEvent, data: DraggableData) => {
    event.preventDefault();
    event.stopPropagation();
  }

  const onDrag = (event: DraggableEvent, data: DraggableData) => {
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
  const onDragStop = (event: DraggableEvent, data: DraggableData) => {
    event.preventDefault();
    event.stopPropagation();
console.log(dragged, isOpen)
    if (!dragged) {
      const temp = !isOpen;
      console.log(dragged, isOpen, temp)
      setIsOpen(temp);
    }
console.log('ended', isOpen)
    // Calc screen bounds
    const height = window.innerHeight || document.documentElement.clientHeight;
    const width = (window.innerWidth - getScrollbarDx()) || document.documentElement.clientWidth;

    // Calc distance to each edge
    const leftDx = data.x - 0;
    const rightDx  = width - (data.x + getSidebarWidth());

    // Set new position on closest edge
    const minY = SIDEBAR_MARGIN;
    const maxY = height - getSidebarHeight() - SIDEBAR_MARGIN;
    const newY = Math.min(Math.max(minY, data.y), maxY);
    if (leftDx < rightDx) {
      setPosition({ x: SIDEBAR_MARGIN, y: newY });
      setClosestEdge(Edge.Left);
    } else { console.log(isOpen, width, getSidebarWidth(), SIDEBAR_MARGIN)
      const newX = width - getSidebarWidth() - SIDEBAR_MARGIN;
      setPosition({ x: newX, y: newY });
      setClosestEdge(Edge.Right);
    }
    console.log('=======================')
  }

  const positionClass = `TbdSidebar--position-${closestEdge === Edge.Left ? 'left' : 'right'}`;
  return (
    <Draggable
      handle=".TbdSidebar__LogoBubble"
      position={position}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onDragStop}
    >
      <div className={`TbdSidebar ${positionClass}`}>
        <div 
          className="TbdSidebar__LogoBubble"
          onClick={(e) => onClick(e)}
          style={{ marginBottom: isOpen ? `${BUBBLE_MARGIN}px` : '0' }}
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
    </Draggable>
  );
}
