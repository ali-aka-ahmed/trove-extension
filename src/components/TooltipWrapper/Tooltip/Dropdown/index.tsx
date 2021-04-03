import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import debounce from 'lodash/debounce';
import React, { useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { GetSpaceUsersRes } from '../../../../app/notionServer/getSpaceUsers';
import { Record } from '../../../../app/notionTypes';
import { IGetPageNamesRes, ISearchPagesRes } from '../../../../app/server/notion';
import {
  addToNotionRecents,
  get,
  get1,
  set,
  setNotionDefault,
} from '../../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../../utils/chrome/tabs';

interface DropdownProps {
  setDropdownClicked: React.Dispatch<React.SetStateAction<boolean>>;
  setItem: (item: Record) => void;
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
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'error' | 'success' | 'info' | 'warning' | undefined>(
    'error',
  );
  const [alertMessage, setAlertMessage] = useState<any>(null!);
  const input = useRef<HTMLInputElement | null>(null);
  const dropdownWrapper = useRef<HTMLDivElement | null>(null);
  const back = useRef<HTMLDivElement>(null!);

  const seedInitialPages = async () => {
    setLoading(true);
    const data = await get(['notionRecents', 'spaceId']);
    const recents = data.notionRecents || {};
    let spaceRecentIds = [];
    if (data.spaceId) {
      spaceRecentIds = (recents[data.spaceId] || []).map((r: Record) => r.id);
    }
    sendMessageToExtension({
      type: MessageType.GetNotionPages,
      recentIds: spaceRecentIds,
      spaceId: data.spaceId,
    }).then((res: IGetPageNamesRes) => {
      setShowAlert(false);
      setLoading(false);
      if (res.success) {
        const spaceId = data.spaceId || res.spaces![0].id;
        const results = res.results![spaceId] || {};
        setItems(
          (results.recents || []).concat(results.databases || []).concat(results.pages || []),
        );
        setSpaces(res.spaces!);
        setSpaceId(spaceId);
        recents[spaceId] = res.results![spaceId].recents;
        set({ notionRecents: recents, spaceId });
      } else {
        setAlertType('error');
        if (res.status === 401) {
          setAlertMessage(
            <span>
              You're not logged into Notion on the web! Click{' '}
              <strong>
                <a
                  style={{ color: '#0d77e2', cursor: 'pointer' }}
                  href="https://www.notion.so/login"
                  target="_blank"
                  onClick={handleLoginCase}
                >
                  here
                </a>
              </strong>{' '}
              to login.
            </span>,
          );
        } else {
          setAlertMessage(res.message);
        }
        setShowAlert(true);
      }
    });
  };

  useEffect(() => {
    seedInitialPages();
  }, []);

  const handleLoginCase = () => {
    setAlertType('success');
    setAlertMessage(
      <span>
        Click{' '}
        <strong>
          <span onClick={seedInitialPages} style={{ color: '#0d77e2', cursor: 'pointer' }}>
            here
          </span>
        </strong>{' '}
        once you've logged in!
      </span>,
    );
  };

  const onKeyDownTextarea = (e: KeyboardEvent) => {
    e.stopPropagation();
    if (!(e.key === 'Escape') && (!items || items.length === 0)) return;
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
        e.stopPropagation();
        handleSelectItem(items[itemIdx]);
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

  const handleSelectItem = async (item: Record) => {
    await Promise.all([addToNotionRecents(spaceId, item), setNotionDefault(spaceId, item)]);
    props.setItem(item);
    props.setDropdownClicked(false);
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
    const sectionName = `${section[0].toUpperCase()}${section.slice(1)}s`;
    if (!sectionItems || sectionItems.length === 0) return;
    return (
      <div className="TroveDropdown__Section" key={section}>
        <div className="TroveDropdown__SectionName">{sectionName}</div>
        {sectionItems.map((r) => renderItem(r))}
      </div>
    );
  };

  const renderItem = (item: Record) => {
    let icon: any;
    if (item.icon?.type === 'emoji') {
      icon = <span className="TroveDropdown__Icon">{item.icon?.value}</span>;
    } else if (item.icon?.type === 'url') {
      icon = (
        <img
          src={chrome.extension.getURL('images/notion/no_page_icon.png')}
          className="TroveDropdown__Icon"
        />
      );
      // sendMessageToExtension({ type: MessageType.GetNotionImage, imageOptions: { url: item.icon.value, table: item.type === 'page' ? 'block' : 'collection', id: '0136b9a0-73d6-4aeb-8951-a62a3648236c', width: '40' }});
      // icon = <img src={ 'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fb9574d9a-b542-490d-868e-da63de48311b%2FMe-Round.png?table=block&id=7dacd67f-5ffc-4ff5-bc76-df2f866a5770&width=40&userId=35dd49dd-0fe7-44a1-886d-3f6ebfbe5429&cache=v2' } className="TroveDropdown__Icon" />
    }

    const idx = items.indexOf(item);

    return (
      <span
        className={`TroveDropdown__Item ${itemIdx === idx ? 'TroveDropdown__Selected' : ''}`}
        onClick={() => handleSelectItem(item)}
        key={item.id}
        id={item.id}
      >
        <div className="TroveDropdown__HeaderWrapper">
          <span className="TroveDropdown__ItemIconWrapper">
            {item.icon ? (
              icon
            ) : (
              <img
                src={chrome.extension.getURL('images/notion/no_page_icon.png')}
                className="TroveDropdown__Icon"
              />
            )}
          </span>
          <span className="TroveDropdown__ItemName">{item.name}</span>
        </div>
        <span className="TroveDropdown__ItemPath">{item.path}</span>
      </span>
    );
  };

  const changeSpace = async (space: Record) => {
    if (input.current) input.current.value = '';
    setSpaceLoadingId(space.id);
    await set({ spaceId: space.id }).then(async () => {
      const getSpaceUsersRes = (await sendMessageToExtension({
        type: MessageType.GetNotionSpaceUsers,
        spaceId,
      })) as GetSpaceUsersRes;
      if (getSpaceUsersRes.success) {
        set({
          spaceUsers: getSpaceUsersRes.users,
          spaceBots: getSpaceUsersRes.bots,
        });
      }
      setShowSpaces(false);
      setSpaceLoadingId('');
      await seedInitialPages();
    });
  };

  const renderSpace = (s: Record) => {
    // let icon: any;
    // if (s.icon?.type === 'url') {
    //   icon = <img
    //     src={ chrome.extension.getURL('images/notion/no_page_icon.png') }
    //     className="TroveDropdown__Icon"
    //   />
    //   // icon = <img src={ item.icon?.value.concat('?table=block&id=7dacd67f-5ffc-4ff5-bc76-df2f866a5770&width=40&userId=35dd49dd-0fe7-44a1-886d-3f6ebfbe5429&cache=v2') } className="TroveDropdown__Icon" />
    // }

    return (
      <div className="TroveDropdown__Space" onClick={() => changeSpace(s)} key={s.id}>
        {/* <span className="TroveDropdown__ItemIconWrapper">
          {s.icon ? ( icon ) : (
            <img src={ chrome.extension.getURL('images/notion/no_page_icon.png') } className="TroveDropdown__Icon" />
          )}
        </span> */}
        <span className="TroveDropdown__SpaceName">{s.name}</span>
        {spaceId === s.id && <div className="TroveDropdown__SpaceSelected" />}
        {spaceLoadingId === s.id && (
          <div className="TroveDropdown__SpaceLoading">
            <LoadingOutlined />
          </div>
        )}
      </div>
    );
  };

  const debouncedSearch = debounce(async (text) => {
    setLoading(true);
    return await sendMessageToExtension({
      type: MessageType.SearchNotionPages,
      spaceId,
      query: text,
    }).then((res: ISearchPagesRes) => {
      setShowAlert(false);
      setLoading(false);
      if (res.success) {
        get1('notionRecents').then((recents: { [spaceId: string]: Record[] }) => {
          setItems((recents[spaceId] || []).concat(res.databases!).concat(res.pages!));
        });
      } else {
        setAlertType('error');
        setShowAlert(true);
        setAlertMessage(res.message);
      }
    });
  }, 350);

  const onChange = async (text: string) => {
    // set height for loading drawer
    const height = dropdownWrapper.current?.clientHeight;
    if (height) {
      if (height > 250) setLoadingHeight(250);
      else setLoadingHeight(height);
    }

    // search
    if (text === '') {
      debouncedSearch.cancel();
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
          <div className="TroveDropdown__Loading" style={{ height: loadingHeight }}>
            <LoadingOutlined />
          </div>
        ) : (
          <div ref={dropdownWrapper}>
            {renderSection('recent')}
            {renderSection('database')}
            {renderSection('page')}
            {items.length === 0 && !showAlert && (
              <div className="TroveDropdown__NoResults">No results</div>
            )}
            {showAlert && (
              <div className="TroveDropdown__Error">
                <Alert
                  showIcon
                  message={alertMessage}
                  type={alertType}
                  className="TbdAuth__Alert"
                />
              </div>
            )}
            <div className="TroveDropdown__ChangeSpace" onClick={() => setShowSpaces(!showSpaces)}>
              <span>
                Can't find a page? Click here to change <br />
                your workspace
              </span>
            </div>
          </div>
        )}
        <div
          className="TroveDropdown__BackButtonWrapper"
          onMouseEnter={() => ReactTooltip.show(back.current!)}
          onMouseLeave={() => ReactTooltip.hide(back.current!)}
          data-tip={`
            <div class="TroveHint__Content">
              <p class="TroveHint__Content__PrimaryText">esc</p>
            </div>
          `}
        >
          <button
            className="TroveDropdown__BackButton"
            onClick={() => props.setDropdownClicked(false)}
          >
            Back
          </button>
        </div>
      </div>
      {showSpaces && (
        <div className="TroveDropdown__Spaces">
          <div className="TroveDropdown__SectionName">Workspaces</div>
          {spaces.map((s) => renderSpace(s))}
        </div>
      )}
      <ReactTooltip
        place="top"
        className="TroveTooltip__Hint"
        effect="solid"
        event={'mouseenter'}
        eventOff={'mouseleave'}
        arrowColor="transparent"
        html={true}
      />
    </div>
  );
}
