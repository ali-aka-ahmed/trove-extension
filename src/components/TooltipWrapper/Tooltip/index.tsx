import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import { ITopic } from '../../../models/IPost';
import Edge from '../../SidebarWrapper/helpers/Edge';
import Point from '../../SidebarWrapper/helpers/Point';
import Pill from './Pill';

const TOOLTIP_MARGIN = 10;
const TOOLTIP_HEIGHT = 150;

export default function Tooltip() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(new Point(0, 0));
  const [positionEdge, setPositionEdge] = useState(Edge.Bottom);
  const [topics, setTopics] = useState<ITopic[]>([{ color: '#ebebeb', text: 'Politics' }]);

  /**
   * Position and display tooltip according to change in selection.
   */
  const onSelectionChange = useCallback(() => {
    const selection = getSelection();
    if (
      selection 
      && selection.rangeCount 
      && !selection.isCollapsed 
      && selection.toString()
    ) {
      const selPos = selection.getRangeAt(0).getBoundingClientRect();
      if (selPos.bottom + TOOLTIP_HEIGHT > document.documentElement.clientHeight) {
        setPositionEdge(Edge.Top);
        setPosition(new Point(
          selPos.left + window.scrollX, 
          selPos.top + window.scrollY - TOOLTIP_HEIGHT - TOOLTIP_MARGIN
        ));
      } else {
        setPositionEdge(Edge.Bottom);
        setPosition(new Point(selPos.left + window.scrollX, selPos.bottom + window.scrollY));
      }
      
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [onSelectionChange]);

  const onPillClose = useCallback((topic: ITopic) => {
    console.log('hi')
    setTopics(topics.slice().filter(t => t !== topic));
  }, [topics]);

  const renderTopics = useCallback(() => {
    const pills = topics.map(topic =>
      <Pill 
        key={topic.text} 
        color={topic.color} 
        text={topic.text}
        closeFn={() => { onPillClose(topic); }}
      />
    );

    return (
      <div className="TbdTooltip__TopicList"> 
        {pills}
      </div>
    );
  }, [topics, onPillClose]);

  return (
    <>
      {isVisible && (
        <div 
          className={classNames('TbdTooltip', {
            'TbdTooltip--position-above': positionEdge === Edge.Top,
            'TbdTooltip--position-below': positionEdge === Edge.Bottom
          })}
          style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0px)` }}
        >
          {renderTopics()}
          <div className="TbdTooltip__SubmitButton"></div>
        </div>
      )}
    </>
  );
}
