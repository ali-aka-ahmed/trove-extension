import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { IGetPageNamesRes, ISearchPagesRes, Record } from '../../../../app/server/notion';
import { get, get1, set } from '../../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../../utils/chrome/tabs';

interface DropdownProps {
  setDropdownClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

export default function Dropdown(props: DropdownProps) {
  const [spaceId, setSpaceId] = useState('');
  const [itemIdx, setItemIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Record[]>([]);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoading(true);
    get([ 'recents', 'spaceId' ]).then((data) => {
      const recentIds = data.recents.map((r: Record) => r.id);
      sendMessageToExtension({ type: MessageType.GetNotionPages, recentIds, spaceId: data.spaceId }).then((res: IGetPageNamesRes) => {
        setShowError(false);
        setLoading(false);
        if (res.success) {
          setItems(res.recents!.concat(res.databases!).concat(res.pages!));
          setSpaceId(res.spaceId!)
        } else {
          setShowError(true);
          setErrorMessage(res.message);
        };
      });
    });
  }, []);

  const onKeyDownTextarea = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!items || items.length === 0) return;
    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        setItemIdx(Math.max(1, itemIdx - 1));
        break;
      };
      case 'ArrowDown': {
        e.preventDefault();
        const newIdx = Math.min(items.length - 1, itemIdx + 1);
        setItemIdx(newIdx);
        break;
      };
      case 'Enter':
      case 'Tab': {
        e.preventDefault();
        props.setText(items[itemIdx].name);
        props.setDropdownClicked(false);
        break;
      };
      case 'Escape': {
        e.preventDefault();
        setItems([]);
        setItemIdx(0);
        props.setDropdownClicked(false);
        break;
      };
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

  const handleSelectItem = (item: Record) => {
    props.setText(item.name);
    props.setDropdownClicked(false);
    get1('recents').then((recents: Record[]) => {
      recents.unshift(item);
      set({ 'recents': recents.slice(0, 5) })
    });
  };

  const renderItem = (item: Record, idx: number) => {
    if (idx <= 0) return;
    return (
      <button
        className={classNames('TroveDropdown__Item', {
          'TroveDropdown__Item--selected': idx === itemIdx,
        })}
        key={item.id}
        onClick={() => handleSelectItem(item)}
      >
        <p className="TroveDropdownItem__Text">{item}</p>
      </button>
    );
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendMessageToExtension({ type: MessageType.SearchNotionPages, spaceId, query: e.target.value }).then((res: ISearchPagesRes) => {
      setShowError(false);
      setLoading(false);
      if (res.success) {
        get1('recents').then((recents: Record[]) => {
          setItems(recents.concat(res.databases!).concat(res.pages!));
          setSpaceId(res.spaceId!);
        })
      } else {
        setShowError(true);
        setErrorMessage(res.message);
      }
    });
  };

  return (
    <div className="TroveTooltip__Dropdown">
      <input
        className="TroveDropdown__Search"
        placeholder="Search for databases or pages..."
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

// TODO AFTER certain amount of time remove the most recents.
// test the fuck and style.
// then potentially add the cmd-D add.
// then add create a notion thing in add.
// then help Aki
