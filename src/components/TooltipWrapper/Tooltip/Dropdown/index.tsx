import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import User from '../../../../entities/User';

interface DropdownProps {
  data: any[];
  textareaRef: React.MutableRefObject<HTMLTextAreaElement | undefined>;
}

export default function Dropdown(props: DropdownProps) {
  const [itemIdx, setItemIdx] = useState(0);
  const [items, setItems] = useState(props.data);

  const onKeyDownTextarea = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!items || items.length === 0) return;
    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        setItemIdx(Math.max(0, itemIdx - 1));
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        const newIdx = Math.min(items.length - 1, itemIdx + 1);
        setItemIdx(newIdx);
        break;
      }
      case 'Enter':
      case 'Tab': {
        e.preventDefault();
        autocomplete(items[itemIdx].username);
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setItems([]);
        setItemIdx(0);
        break;
      }
    }
  };

  useEffect(() => {
    props.textareaRef.current?.addEventListener('keydown', onKeyDownTextarea);
    return () => props.textareaRef.current?.removeEventListener('keydown', onKeyDownTextarea);
  }, [onKeyDownTextarea]);

  const autocomplete = (str: string) => {};

  const renderItem = (item: any, idx: number) => {
    if (item instanceof User) {
      return (
        <button
          className={classNames('TroveDropdown__SuggestedUser', {
            'TroveDropdown__SuggestedUser--selected': idx === itemIdx,
          })}
          key={item.id}
          onClick={() => autocomplete(item.username)}
        >
          <div className="TroveSuggestedUser__Left">
            <div className="TroveSuggestedUser__UserBubble" style={{ backgroundColor: item.color }}>
              {item.username[0]}
            </div>
          </div>
          <div className="TroveSuggestedUser__Right">
            <p className="TroveSuggestedUser__DisplayName">{item.displayName}</p>
            <p className="TroveSuggestedUser__Username" style={{ color: item.color }}>
              {`@${item.username}`}
            </p>
          </div>
        </button>
      );
    }
  };

  return (
    <div className="TroveTooltip__Dropdown">{items.map((item, idx) => renderItem(item, idx))}</div>
  );
}
