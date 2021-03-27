import { LoadingOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { Bot, GetSpaceUsersRes, User } from '../../../../../app/notionServer/getSpaceUsers';
import { AnyPropertyUpdateData } from '../../../../../app/notionTypes/dbUpdate';
import { PersonProperty, SchemaPropertyType } from '../../../../../app/notionTypes/schema';
import { get, get1, set } from '../../../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../../../utils/chrome/tabs';

interface PersonPropertyProps {
  property: PersonProperty;
  root: ShadowRoot;
  updateProperty: (
    propertyId: string,
    type: SchemaPropertyType,
    data: AnyPropertyUpdateData,
  ) => void;
}

const PersonProperty = ({ property, root, updateProperty }: PersonPropertyProps) => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedValues, setSelectedValues] = useState<(User | Bot)[]>([]);
  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [botOptions, setBotOptions] = useState<Bot[]>([]);
  const [optionIdx, setOptionIdx] = useState(0);

  useEffect(() => {
    const userIds = selectedValues.filter((v) => v.type === 'user').map((user) => user.id);
    updateProperty(property.propertyId, property.type, userIds);
  }, [selectedValues]);

  useEffect(() => {
    const loadOptions = async () => {
      get1('spaceId').then((spaceId: string) => {
        sendMessageToExtension({ type: MessageType.GetNotionSpaceUsers, spaceId }).then(
          (res: GetSpaceUsersRes) => {
            if (res.success === false) {
              get(['spaceUsers', 'spaceBots']).then((data) => {
                const spaceUsers: User[] = data.spaceUsers;
                const spaceBots: Bot[] = data.spaceBots;
                setUserOptions(spaceUsers);
                setBotOptions(spaceBots);
                const selectedValues =
                  ((property.value || [])
                    .map((id) => {
                      const u = spaceUsers.find((u: User) => u.id === id);
                      const b = spaceBots.find((b: Bot) => b.id === id);
                      if (u) return u;
                      else if (b) return b;
                      else return null;
                    })
                    .filter((v) => v !== null) as (User | Bot)[]) || [];
                setSelectedValues(selectedValues);
              });
            } else {
              set({
                spaceUsers: res.users,
                spacebots: res.bots,
              });
              setUserOptions(res.users);
              setBotOptions(res.bots);
              const selectedValues =
                ((property.value || [])
                  .map((id) => {
                    const u = res.users.find((u: User) => u.id === id);
                    const b = res.bots.find((b: Bot) => b.id === id);
                    if (u) return u;
                    else if (b) return b;
                    else return null;
                  })
                  .filter((v) => v !== null) as (User | Bot)[]) || [];
              setSelectedValues(selectedValues);
            }
            setLoading(false);
          },
        );
      });
    };
    setLoading(true);
    loadOptions();
  }, []);

  const handleClickOutsidePropertyInput = (e: MouseEvent) => {
    const elems = root.getElementById('TroveEditorPersonWrapper');
    if (elems && !elems?.contains(e.target as Element)) {
      e.preventDefault();
      setEditing(false);
    }
  };

  useEffect(() => {
    if (editing) root.addEventListener('click', handleClickOutsidePropertyInput);
    return () => root.removeEventListener('click', handleClickOutsidePropertyInput);
  }, [editing, handleClickOutsidePropertyInput]);

  const handleSelectItem = (
    e:
      | KeyboardEvent
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: User | Bot,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    // Select values
    if (!selectedValues.map((o) => o.id).includes(option.id))
      setSelectedValues(selectedValues.concat([option]));
    setInputValue('');
  };

  const optionFilter = (o: User | Bot) => {
    return (
      inputValue === '' ||
      (o.type === 'bot' &&
        o.name.slice(0, inputValue.length).toLowerCase() === inputValue.toLowerCase()) ||
      (o.type === 'user' &&
        `${o.firstName} ${o.lastName}`.slice(0, inputValue.length).toLowerCase() ===
          inputValue.toLowerCase())
    );
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const filteredUserOptions = userOptions.filter(optionFilter);
    // const filteredBotOptions = botOptions.filter(optionFilter);
    // const filteredOptions = (filteredUserOptions as (User | Bot)[]).concat(filteredBotOptions);
    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        e.stopPropagation();
        // if (filteredOptions.length === 0) return;
        if (filteredUserOptions.length === 0) return;
        setOptionIdx(Math.max(0, optionIdx - 1));
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        e.stopPropagation();
        // if (filteredOptions.length === 0) return;
        if (filteredUserOptions.length === 0) return;
        // const newIdx = Math.min(filteredOptions.length - 1, optionIdx + 1);
        const newIdx = Math.min(filteredUserOptions.length - 1, optionIdx + 1);
        setOptionIdx(newIdx);
        break;
      }
      case 'Enter':
      case 'Tab': {
        e.preventDefault();
        e.stopPropagation();
        // if (filteredOptions.length === 0) return;
        if (filteredUserOptions.length === 0) return;
        // handleSelectItem(e, filteredOptions[optionIdx]);
        handleSelectItem(e, filteredUserOptions[optionIdx]);
        break;
      }
      case 'Escape': {
        e.preventDefault();
        e.stopPropagation();
        setInputValue('');
        setOptionIdx(0);
        setEditing(false);
        break;
      }
      case 'Backspace': {
        if (inputValue === '') {
          e.preventDefault();
          e.stopPropagation();
          setSelectedValues(selectedValues.slice(0, selectedValues.length - 1));
          break;
        }
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptionIdx(0);
    setInputValue(e.target.value);
  };

  const removePerson = (id: string) => {
    setSelectedValues(selectedValues.filter((o) => o.id !== id));
  };

  const renderImage = (person: User | Bot) => {
    if (person.type === 'bot') return '🤖';
    else return '👋';
    // <img src={ renderImage() } className="TroveDropdown__Icon" />
  };

  const renderPerson = (o: User | Bot, showClose: boolean, extraClass?: string) => {
    return (
      <div
        key={o.id}
        className={`TrovePill ${extraClass}`}
        style={{
          ...(showClose ? { paddingRight: '0' } : {}),
        }}
      >
        <span className="TroveProperty__PersonIconWrapper">{renderImage(o)}</span>
        <span className="TroveProperty__ReadOnlyPersonName">
          {o.type === 'user' ? `${o.firstName} ${o.lastName}` : o.name}
        </span>
        {showClose && (
          <div className="TrovePill__CloseButton" onClick={() => removePerson(o.id)}>
            <img
              style={{ width: '7px' }}
              src={chrome.extension.getURL('images/notion/properties/close_select_option.png')}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="TroveProperty__Property">
      <div className="TroveProperty__PropertyNameWrapper">
        <div className="TroveProperty__PropertyImgWrapper">
          <img
            src={chrome.extension.getURL(`images/notion/properties/${property.type}.png`)}
            className="TroveProperty__PropertyImg"
          />
        </div>
        <div className="TroveProperty__PropertyName">{property.name}</div>
      </div>
      {!editing ? (
        <div className="TroveProperty__ReadOnlyWrapper" onClick={() => setEditing(true)}>
          {loading ? (
            <div className="TroveProperty__SelectReadOnlyWrapper">
              <div
                className="TroveProperty--loading"
                style={{ color: 'rgb(55, 53, 47)', margin: '0' }}
              >
                <LoadingOutlined />
              </div>
            </div>
          ) : (
            <div
              className="TroveProperty__SelectReadOnlyWrapper"
              style={selectedValues.length > 0 ? { paddingBottom: '1px' } : {}}
            >
              {selectedValues.length > 0
                ? selectedValues.map((o) => renderPerson(o, false))
                : 'Empty'}
            </div>
          )}
        </div>
      ) : (
        <div
          className="TroveProperty__EditorWrapper"
          style={{ boxShadow: 'none' }}
          id="TroveEditorPersonWrapper"
        >
          <div className="TroveProperty__SelectWrapper">
            <div className="TroveProperty__InputWrapper TroveProperty__InputWrapper--Select">
              {selectedValues?.length > 0 && (
                <div className="TroveProperty__SelectedPills">
                  {selectedValues.map((o) => renderPerson(o, true))}
                </div>
              )}
              <input
                className="TroveProperty__Input"
                autoFocus
                value={inputValue}
                onChange={handleInputChange}
                placeholder={selectedValues?.length === 0 ? 'Search for an option...' : ''}
                onKeyDown={(e) => handleOnKeyDown(e)}
                style={{ backgroundColor: '#F4F4F2' }}
              />
            </div>
            <div className="TroveProperty__Options">
              {userOptions.filter(optionFilter).length > 0 && (
                <>
                  <div className="TroveProperty__OptionDropdownExplainer">Select a person</div>
                  {userOptions.filter(optionFilter).map((o, i) => {
                    return (
                      <div
                        className="TroveProperty__PillRow"
                        key={o.id}
                        onClick={(e) => handleSelectItem(e, o)}
                        style={i === optionIdx ? { backgroundColor: '#EEEEED' } : {}}
                      >
                        {renderPerson(o, false, 'TrovePill--nowrap')}
                      </div>
                    );
                  })}
                </>
              )}
              {/* {botOptions.filter(optionFilter).length > 0 && (
                <>
                  <div
                    className="TroveProperty__OptionDropdownExplainer"
                    style={userOptions.filter(optionFilter).length > 0 ? { marginTop: '7px' } : {}}
                  >
                    Select a bot
                  </div>
                  {botOptions.filter(optionFilter).map((o, i) => {
                    return (
                      <div
                        className="TroveProperty__PillRow"
                        key={o.id}
                        onClick={(e) => handleSelectItem(e, o)}
                        style={
                          i + userOptions.filter(optionFilter).length === optionIdx
                            ? { backgroundColor: '#EEEEED' }
                            : {}
                        }
                      >
                        {renderPerson(o, false, 'TrovePill--nowrap')}
                      </div>
                    );
                  })}
                </>
              )} */}
              {/* {botOptions.filter(optionFilter).length + userOptions.filter(optionFilter).length === */}
              {userOptions.filter(optionFilter).length === 0 && (
                <div
                  className="TroveProperty__PropertyValue"
                  style={{ padding: '15px', paddingBottom: '4px' }}
                >
                  No results found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonProperty;
