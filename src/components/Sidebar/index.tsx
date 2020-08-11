import React from 'react';
import Bubble from './bubble';
import './index.scss';

export default function Sidebar() {
  const sampleData = [
    { id: 1, name: 'aki' },
    { id: 2, name: 'ali' },
    { id: 3, name: 'abhi' }
  ]
  const bubbles = sampleData.map((sd) => <Bubble key={sd.id} />);

  const onDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      className='tbd-sidebar'
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragEnd={onDragEnd}
    >
      {bubbles}
    </div>
  );
}
