import seedrandom from 'alea';
import React from 'react';
import User from '../../../models/User';
import './index.scss';

export default function Bubble(props: BubbleProps) {
  const bgColor = getPastelColor(props.user.name);

  return <div className="TbdBubble" style={{ backgroundColor: bgColor }}/>;
}

function getPastelColor(seed: string): string {
  const rand = seedrandom(seed)();
  return `hsl(${360 * rand}, ${25 + 70 * rand}%, ${85 + 10 * rand}%)`;
}

interface BubbleProps {
  key: number;
  user: User;
}
