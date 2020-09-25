import seedrandom from 'alea';
import React from 'react';
import { User } from '../../../../common';

export default function Bubble(props: BubbleProps) {
  const bgColor = getPastelColor(props.user.displayName);

  const name = () => {
    if (!props.user.displayName || props.user.displayName === '') return '';
    return props.user.displayName.charAt(0);
  }

  const handleClick = (e) => {
    console.log('HELP')
  }

  return (
    <div 
      className={`TbdSidebar__Handle TbdSidebar__Bubble ${props.visible ? '' : 'hidden'}`}
      onClick={handleClick} 
      style={{ 
        backgroundColor: bgColor, 
        // marginTop: props.visible ? '0' : `-${BUBBLE_HEIGHT}px`,
        // marginBottom: props.visible ? `${BUBBLE_MARGIN}px` : '0'
      }}
    >
      <p className="TbdSidebar__Bubble__DisplayChar">{name()}</p>
    </div>
  );
}

function getPastelColor(seed: string): string {
  const rand = seedrandom(seed)();
  return `hsl(${360 * rand}, ${25 + 70 * rand}%, ${85 + 10 * rand}%)`;
}

interface BubbleProps {
  key: string;
  user: User;
  visible: boolean;
}
