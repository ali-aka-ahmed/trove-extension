import seedrandom from 'alea';
import React from 'react';
import User from '../../../models/User';
// import './index.scss';

export default function Bubble(props: BubbleProps) {
  const bgColor = getPastelColor(props.user.name);

  const name = () => {
    if (!props.user.name || props.user.name === '') return '';
    return props.user.name.charAt(0);
  }

  const handleClick = (e) => {
    console.log("HELP")
  }

  return (
    <div className="TbdSidebar__Bubble handle" onClick={handleClick} style={{ backgroundColor: bgColor }}>
      <p className="TbdSidebar__Bubble__DisplayChar">{name()}</p>
    </div>
  );
}

function getPastelColor(seed: string): string {
  const rand = seedrandom(seed)();
  return `hsl(${360 * rand}, ${25 + 70 * rand}%, ${85 + 10 * rand}%)`;
}

interface BubbleProps {
  key: number;
  user: User;
}
