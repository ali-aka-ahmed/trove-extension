import { LoadingOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import React, { useEffect, useRef, useState } from 'react';
import { IGetPageNamesRes, ISearchPagesRes, Record } from '../../../../app/server/notion';
import { get, get1, set } from '../../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../../utils/chrome/tabs';

interface DropdownProps {
  setDropdownClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setItem: React.Dispatch<React.SetStateAction<Record>>;
  root: ShadowRoot;
}

export default function Dropdown(props: DropdownProps) {
  const [itemIdx, setItemIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingHeight, setLoadingHeight] = useState(250);
  const [items, setItems] = useState<Record[]>([]);
  const [spaceId, setSpaceId] = useState('');
  const [spaces, setSpaces] = useState<Record[]>([]);
  const [spaceLoadingId, setSpaceLoadingId] = useState('');
  const [showSpaces, setShowSpaces] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const input = useRef<HTMLInputElement | null>(null);
  const dropdownWrapper = useRef<HTMLDivElement | null>(null);

  const seedInitialPages = async () => {
    setLoading(true);
    const data = await get([ 'notionRecents', 'spaceId' ])
    const recents = data.notionRecents;
    const spaceRecentIds = ((data.notionRecents || {})[data.spaceId] || []).map((r: Record) => r.id);
    sendMessageToExtension({ type: MessageType.GetNotionPages, recentIds: spaceRecentIds, spaceId: data.spaceId }).then((res: IGetPageNamesRes) => {
      setShowError(false);
      setLoading(false);
      if (res.success) {
        const spaceId = data.spaceId;
        const results = res.results![spaceId] || {};
        setItems((results.recents || []).concat((results.databases || [])).concat((results.pages || [])));
        setSpaces(res.spaces!);
        setSpaceId(spaceId);
        recents[spaceId] = res.results![spaceId].recents;
        set({
          'notionDefaults': res.defaults,
          'notionRecents': recents,
          'spaceId': spaceId
        });
      } else {
        setShowError(true);
        setErrorMessage(res.message);
      };
    });
  }

  useEffect(() => {
    seedInitialPages();
  }, []);

  const onKeyDownTextarea = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!(e.key === 'Escape') && (!items || items.length === 0)) return;
    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        setItemIdx(Math.max(0, itemIdx - 1));
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

  const handleSelectItem = async (item: Record) => {
    props.setItem(item);
    props.setDropdownClicked(false);
    
    // ideally move this return item on backend write, and then set when receiving.
    const data = await get([ 'notionRecents', 'notionDefaults' ])
    item.section = 'recent'

    // change recents
    let newRecents = data.notionRecents[spaceId];
    if (!newRecents) newRecents = [];

    const existingRecentIds = newRecents.map((item: Record) => item.id)
    if (existingRecentIds.includes(item.id)) {
      const index = existingRecentIds.indexOf(item.id);
      newRecents.splice(index, 1);
    }
    newRecents.unshift(item);
    newRecents = newRecents.slice(0, 3);

    // change defaults
    const newDefaults = data.notionDefaults || {};
    newDefaults[spaceId] = item;

    data.notionRecents[spaceId] = newRecents

    set({
      notionRecents: data.notionRecents,
      notionDefaults: newDefaults
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

  const renderSection = (section: 'recent' | 'database' | 'page') => {
    const sectionItems = items.filter((r) => r.section === section);
    const sectionName = `${section[0].toUpperCase()}${section.slice(1)}s`
    if (!sectionItems || sectionItems.length === 0) return;
    return (
      <div className="TroveDropdown__Section" key={section}>
        <div className="TroveDropdown__SectionName">{sectionName}</div>
        {sectionItems.map((r) => renderItem(r))}
      </div>
    )
  }

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

    const idx = items.indexOf(item)

    return (
      <span
        className={`TroveDropdown__Item ${itemIdx === idx ? 'TroveDropdown__Selected' : ''}`}
        onClick={() => handleSelectItem(item)}
        key={item.id}
        id={item.id}
      >
        <div className="TroveDropdown__HeaderWrapper">
          <span className="TroveDropdown__ItemIconWrapper">
            {item.icon ? ( icon ) : (
              <img src={ chrome.extension.getURL('images/noIconNotion.png') } className="TroveDropdown__Icon" />
            )}
          </span>
          <span className="TroveDropdown__ItemName">{item.name}</span>
        </div>
        <span className="TroveDropdown__ItemPath">{item.path}</span>
      </span>
    )
  }

  const changeSpace = (space: Record) => {
    if (input.current) input.current.value = ''
    setSpaceLoadingId(space.id)
    set({ spaceId: space.id }).then(() => {
      seedInitialPages().then(() => {
        setShowSpaces(false);
        setSpaceLoadingId('')
      })
    });
  }
  
  const renderSpace = (s: Record) => {
    // let icon: any;
    // if (s.icon?.type === 'url') {
    //   icon = <img
    //     src={ chrome.extension.getURL('images/noIconNotion.png') }
    //     className="TroveDropdown__Icon"
    //   />
    //   // icon = <img src={ item.icon?.value.concat('?table=block&id=7dacd67f-5ffc-4ff5-bc76-df2f866a5770&width=40&userId=35dd49dd-0fe7-44a1-886d-3f6ebfbe5429&cache=v2') } className="TroveDropdown__Icon" />
    // }

    return (
      <div className="TroveDropdown__Space" onClick={() => changeSpace(s)} key={s.id}>
        {/* <span className="TroveDropdown__ItemIconWrapper">
          {s.icon ? ( icon ) : (
            <img src={ chrome.extension.getURL('images/noIconNotion.png') } className="TroveDropdown__Icon" />
          )}
        </span> */}
        <span className="TroveDropdown__SpaceName">{s.name}</span>
        {spaceId === s.id && (
          <div className="TroveDropdown__SpaceSelected"/>
        )}
        {spaceLoadingId === s.id && (
          <div className="TroveDropdown__SpaceLoading">
            <LoadingOutlined />
          </div>
        )}
      </div>
    )
  }

  const debouncedSearch = debounce(async (text) => {
    setLoading(true);
    return await sendMessageToExtension({ type: MessageType.SearchNotionPages, spaceId, query: text }).then((res: ISearchPagesRes) => {
      setShowError(false);
      setLoading(false);
      if (res.success) {
        get1('notionRecents').then((recents: { [spaceId: string]: Record[] }) => {
          setItems((recents[spaceId] || []).concat(res.databases!).concat(res.pages!));
        })
      } else {
        setShowError(true);
        setErrorMessage(res.message);
      }
    });
  }, 350);
  
  const onChange = async (text: string) => {
    // set height for loading drawer
    const height = dropdownWrapper.current?.clientHeight;
    if (height) {
      if (height > 250) setLoadingHeight(250)
      else setLoadingHeight(height)
    }

    // search
    if (text === '') {
      debouncedSearch.cancel()
      await seedInitialPages();
    } else {
      await debouncedSearch(text);
    }
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
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="TroveDropdown__ItemsWrapper">
        {loading ? (
          <div className="TroveDropdown__Loading" style={{height: loadingHeight}}>
            <LoadingOutlined />
          </div>
        ) : (
          <div ref={dropdownWrapper}>
            {renderSection('recent')}
            {renderSection('database')}
            {renderSection('page')}
            {items.length === 0 && (
              <div className="TroveDropdown__NoResults">
                No results
              </div>
            )}
            <div className="TroveDropdown__ChangeSpace" onClick={() => setShowSpaces(!showSpaces)}>
              <span>Can't find a page? Click here to change your workspace</span>
            </div>
          </div>
        )}
      </div>
      {showSpaces && (
        <div className="TroveDropdown__Spaces">
          <div className="TroveDropdown__SectionName">Workspaces</div>
          {spaces.map((s) => renderSpace(s))}
        </div>
      )}
    </div>
  );
}