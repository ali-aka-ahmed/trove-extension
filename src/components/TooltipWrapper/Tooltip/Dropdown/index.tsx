import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { getPageNames, getPageNamesByPrefix } from '../../../../app/server/notion';

interface DropdownProps {
  setDropdownClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

export default function Dropdown(props: DropdownProps) {
  const [itemIdx, setItemIdx] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(['input placeholder'].concat(getPageNames(10)));
  }, []);

  const onKeyDownTextarea = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!items || items.length === 0) return;
    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        setItemIdx(Math.max(1, itemIdx - 1));
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
        props.setText(items[itemIdx]);
        props.setDropdownClicked(false);
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setItems([]);
        setItemIdx(0);
        props.setDropdownClicked(false);
        break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDownTextarea);
    return () => document.removeEventListener('keydown', onKeyDownTextarea);
  }, [onKeyDownTextarea]);

  // const autocomplete = (str: string) => {
  //   const ta = props.textareaRef.current;
  //   if (!ta || !ta.textContent) return;

  //   // Autocomplete logic
  //   const currWord = getCurrentWord(ta);
  //   const text1 = ta.value.slice(0, ta.selectionStart); // Up to end of username prefix
  //   const text2 = str.slice(currWord.length - 1); // Autocompleted username
  //   const text3 = ta.value.slice(ta.selectionStart); // End of username to end of text
  //   props.setText(`${text1}${text2}${text3} `);

  //   // Set cursor to correct position
  //   const selectionIdx = text1.length + text2.length + 1;
  //   ta.setSelectionRange(selectionIdx, selectionIdx);

  //   // Hide dropdown
  //   setItems([]);
  //   setItemIdx(0);
  // };

  const renderItem = (item: any, idx: number) => {
    if (idx <= 0) return;
    return (
      <button
        className={classNames('TroveDropdown__Item', {
          'TroveDropdown__Item--selected': idx === itemIdx,
        })}
        key={item}
        onClick={() => {
          props.setText(item);
          props.setDropdownClicked(false);
        }}
      >
        <p className="TroveDropdownItem__Text">{item}</p>
      </button>
    );
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItems(['input placeholder'].concat(getPageNamesByPrefix(e.target.value)));
  };

  return (
    <div className="TroveTooltip__Dropdown">
      <input
        className="TroveDropdown__Search"
        placeholder="Find a page..."
        autoFocus={true}
        ref={input}
        onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
          e.stopPropagation();
        }}
        onChange={onChange}
      ></input>
      {items.map((item, idx) => renderItem(item, idx))}
    </div>
  );
}
