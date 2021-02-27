import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IGetPageNamesRes, ISearchPagesRes, Record } from '../../../../app/server/notion';
import { get, get1, set } from '../../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../../utils/chrome/tabs';

interface DropdownProps {
  setDropdownClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setItem: React.Dispatch<React.SetStateAction<Record>>;
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
    get([ 'notionRecents', 'spaceId' ]).then((data) => {
      // if any recents have expired, remove them and do not retrieve them
      const unexpiredRecents = (data.notionRecents || [])
        .filter((r: Record) => r.section === 'recent' && r.datetimeExpiry > Date.now());

      // fetch recents and relevant pages for the user
      const unexpiredRecentIds = unexpiredRecents.map((r: Record) => r.id);
      sendMessageToExtension({ type: MessageType.GetNotionPages, recentIds: unexpiredRecentIds , spaceId: data.spaceId }).then((res: IGetPageNamesRes) => {
        setShowError(false);
        setLoading(false);
        if (res.success) {
          setItems(res.recents!.concat(res.databases!).concat(res.pages!));
          setSpaceId(res.spaceId!)
          set({ 'notionRecents': res.recents });
        } else {
          setShowError(true);
          setErrorMessage(res.message);
        };
      });
    });
  }, []);

  const onKeyDownTextarea = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!(e.key === 'Escape') && (!items || items.length === 0)) return;
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
        props.setItem(items[itemIdx]);
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
    props.setItem(item);
    props.setDropdownClicked(false);
    set({ 'notionDefault': item });
    // ideally move this return item on backend write, and then set when receiving.
    get1('notionRecents').then((recents: Record[]) => {
      item.section = 'recent'
      //@ts-ignore
      item.datetimeExpiry = Date.now() + 172800000;
      recents.unshift(item);
      set({ 'notionRecents': recents.slice(0, 5) })
    });
  };

  // const renderItem = (item: Record, idx: number) => {
  //   if (idx <= 0) return;
  //   return (
  //     <button
  //       className={classNames('TroveDropdown__Item', {
  //         'TroveDropdown__Item--selected': idx === itemIdx,
  //       })}
  //       key={item.id}
  //       onClick={() => handleSelectItem(item)}
  //     >
  //       <p className="TroveDropdownItem__Text">{item.name}</p>
  //     </button>
  //   );
  // };

  const renderSection = useCallback((section: 'recent' | 'database' | 'page') => {
    const sectionItems = items.filter((r) => r.section === section);
    const sectionName = `${section[0].toUpperCase()}${section.slice(1)}s`
    if (!sectionItems || sectionItems.length === 0) return;
    return (
      <div className="TroveDropdown__Section">
        <div className="TroveDropdown__SectionName">{sectionName}</div>
        {sectionItems.map((r) => renderItem(r))}
      </div>
    )
  }, [items.length])

  const renderItem = (item: Record) => {
    let icon: any;
    if (item.icon?.type === 'emoji') {
      icon = <span className="TroveDropdown__Icon">{item.icon?.value}</span>
    } else if (item.icon?.type === 'url') {
      icon = <img
        src={ chrome.extension.getURL('images/noIconNotion.png') }
        className="TroveDropdown__Icon"
      />
      // icon = <img src={ item.icon?.value.concat('?table=block&id=7dacd67f-5ffc-4ff5-bc76-df2f866a5770&width=40&userId=35dd49dd-0fe7-44a1-886d-3f6ebfbe5429&cache=v2') } className="TroveDropdown__Icon" />
    }
    return (
      <span className="TroveDropdown__Item" onClick={() => handleSelectItem(item)}>
        <span className="TroveDropdown__ItemIconWrapper">
          {item.icon ? ( icon ) : (
            <img src={ chrome.extension.getURL('images/noIconNotion.png') } className="TroveDropdown__Icon" />
          )}
        </span>
        <span className="TroveDropdown__ItemName">{item.name}</span>
      </span>
    )
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sendMessageToExtension({ type: MessageType.SearchNotionPages, spaceId, query: e.target.value }).then((res: ISearchPagesRes) => {
      setShowError(false);
      setLoading(false);
      if (res.success) {
        get1('notionRecents').then((recents: Record[]) => {
          if (!recents) setItems(res.databases!.concat(res.pages!));
          else setItems(recents.concat(res.databases!).concat(res.pages!));
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
      />
      <div className="TroveDropdown__ItemsWrapper">
        {renderSection('recent')}
        {renderSection('database')}
        {renderSection('page')}
      </div>
    </div>
  );
}