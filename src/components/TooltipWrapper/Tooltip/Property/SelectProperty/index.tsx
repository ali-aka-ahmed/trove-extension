import React, { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import {
  AnyPropertyUpdateData,
  MultiSelectOptionPropertyUpdate,
  SelectOptionPropertyUpdate,
} from '../../../../../app/notionTypes/dbUpdate';
import {
  MultiSelectProperty,
  SchemaPropertyType,
  SelectOption,
  SelectProperty,
} from '../../../../../app/notionTypes/schema';
import { NOTION_COLORS, NOTION_COLOR_KEYS_LIST } from '../../../../../constants/index';
import { toArray } from '../../../../../utils';

interface SelectPropertyProps {
  property: SelectProperty | MultiSelectProperty;
  root: ShadowRoot;
  updateProperty: (
    propertyId: string,
    type: SchemaPropertyType,
    data: AnyPropertyUpdateData,
  ) => void;
}

const SelectProperty = ({ property, root, updateProperty }: SelectPropertyProps) => {
  const [editing, setEditing] = useState(false);
  const [editingHeight, setEditingHeight] = useState('100%');
  const [inputValue, setInputValue] = useState('');
  const [showNewOption, setShowNewOption] = useState(false);
  const [optionIdx, setOptionIdx] = useState(0);

  // new option
  const [newOption, setNewOption] = useState<SelectOption & { new: true }>({
    id: uuid(),
    color: NOTION_COLOR_KEYS_LIST[Math.floor(Math.random() * NOTION_COLOR_KEYS_LIST.length)],
    value: '',
    new: true,
  });
  // selected values
  const [selectedValues, setSelectedValues] = useState<(SelectOption & { new?: true })[]>(
    toArray<SelectOption>(property.value || []),
  );
  // options
  const [options, setOptions] = useState<(SelectOption & { new?: true })[]>(property.options || []);

  const handleClickOutsidePropertyInput = (e: MouseEvent) => {
    const elems = root.getElementById(`TroveEditorWrapper--${property.propertyId}`);
    if (elems && !elems?.contains(e.target as Element)) {
      e.preventDefault();
      setInputValue('');
      setOptionIdx(0);
      setEditing(false);
    }
  };

  useEffect(() => {
    if (editing) root.addEventListener('click', handleClickOutsidePropertyInput);
    return () => root.removeEventListener('click', handleClickOutsidePropertyInput);
  }, [editing, handleClickOutsidePropertyInput]);

  useEffect(() => {
    if (property.type === SchemaPropertyType.MultiSelect) {
      const selected = selectedValues.map((o) => ({ id: o.id, value: o.value, color: o.color }));
      const newOptions = options
        .filter((o) => o.new)
        .map((o) => ({ id: o.id, value: o.value, color: o.color }));
      const newUpdate: MultiSelectOptionPropertyUpdate = { selected, newOptions };
      updateProperty(property.propertyId, property.type, newUpdate);
    } else if (property.type === SchemaPropertyType.Select) {
      if (selectedValues.length === 0) return;
      const selected = selectedValues.map((o) => ({ id: o.id, value: o.value, color: o.color }))[0];
      const newOptions = options
        .filter((o) => o.new)
        .map((o) => ({ id: o.id, value: o.value, color: o.color }));
      const newUpdate = { selected, newOptions } as SelectOptionPropertyUpdate;
      updateProperty(property.propertyId, property.type, newUpdate);
    }
  }, [selectedValues]);

  const handleSelectItem = (
    e:
      | KeyboardEvent
      | React.KeyboardEvent<HTMLInputElement>
      | React.MouseEvent<HTMLDivElement, MouseEvent>,
    option: SelectOption,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    // Select values
    if (property.type === SchemaPropertyType.Select) setSelectedValues([option]);
    else if (
      property.type === SchemaPropertyType.MultiSelect &&
      !selectedValues.map((o) => o.id).includes(option.id)
    ) {
      setSelectedValues(selectedValues.concat([option]));
    }

    // Add to options
    if (!options.map((o) => o.id).includes(option.id)) setOptions([...options, option]);

    // Handle drawer
    if (property.type === SchemaPropertyType.Select) {
      setInputValue('');
      setOptionIdx(0);
      setEditing(false);
    }
    setShowNewOption(false);
    setNewOption({
      id: uuid(),
      color: NOTION_COLOR_KEYS_LIST[Math.floor(Math.random() * NOTION_COLOR_KEYS_LIST.length)],
      value: '',
      new: true,
    });
    setInputValue('');
  };

  const optionFilter = (o: SelectOption) => {
    return (
      inputValue === '' ||
      o.value.slice(0, inputValue.length).toLowerCase() === inputValue.toLowerCase()
    );
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        e.stopPropagation();
        setOptionIdx(Math.max(0, optionIdx - 1));
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        e.stopPropagation();
        const filteredOptions = options.filter(optionFilter);
        const maxIndex = showNewOption ? filteredOptions.length : filteredOptions.length - 1;
        const newIdx = Math.min(maxIndex, optionIdx + 1);
        setOptionIdx(newIdx);
        break;
      }
      case 'Enter':
      case 'Tab': {
        e.preventDefault();
        e.stopPropagation();
        const filteredOptions = options.filter(optionFilter);
        if (filteredOptions[optionIdx] === undefined && newOption.value !== '') {
          handleSelectItem(e, newOption);
        } else handleSelectItem(e, filteredOptions[optionIdx]);
        if (property.type === SchemaPropertyType.Select) {
          setInputValue('');
          setOptionIdx(0);
          setEditing(false);
        }
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

  const handleSetEditing = () => {
    const elem = root.getElementById(
      `TroveProperty__SelectReadOnlyWrapper--${property.propertyId}`,
    );
    if (elem) {
      const height = elem.clientHeight;
      setEditingHeight(`${height}px`);
    } else {
      setEditingHeight('100%');
    }
    setEditing(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptionIdx(0);
    setNewOption({
      ...newOption,
      value: e.target.value,
    });
    setInputValue(e.target.value);
    if (options.map((o) => o.value).includes(e.target.value) || e.target.value === '') {
      setShowNewOption(false);
    } else setShowNewOption(true);
  };

  const removePill = (id: string) => {
    setSelectedValues(selectedValues.filter((o) => o.id !== id));
  };

  const renderPill = (o: SelectOption, showClose: boolean, extraClass?: string) => {
    return (
      <div
        key={o.id}
        className={`TrovePill ${extraClass}`}
        style={{
          ...(showClose ? { paddingRight: '0' } : {}),
          backgroundColor: NOTION_COLORS[o.color],
        }}
      >
        <span className="TrovePill__Value">{o.value}</span>
        <div
          className="TrovePill__CloseButton"
          onClick={() => removePill(o.id)}
          style={showClose ? {} : { display: 'none' }}
        >
          <img
            style={{ width: '7px' }}
            src={chrome.extension.getURL('images/notion/properties/close_select_option.png')}
          />
        </div>
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
        <div className="TroveProperty__ReadOnlyWrapper" onClick={handleSetEditing}>
          <div
            className="TroveProperty__SelectReadOnlyWrapper"
            style={selectedValues.length > 0 ? { paddingBottom: '1px' } : {}}
            id={`TroveProperty__SelectReadOnlyWrapper--${property.propertyId}`}
          >
            {selectedValues.length > 0 ? selectedValues.map((o) => renderPill(o, false)) : 'Empty'}
          </div>
        </div>
      ) : (
        <div
          className="TroveProperty__EditorWrapper"
          style={{ boxShadow: 'none', height: editingHeight }}
          id={`TroveEditorWrapper--${property.propertyId}`}
        >
          <div className="TroveProperty__SelectWrapper">
            <div className="TroveProperty__InputWrapper TroveProperty__InputWrapper--Select">
              {selectedValues?.length > 0 && (
                <div className="TroveProperty__SelectedPills">
                  {selectedValues.map((o) => renderPill(o, true))}
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
              <div className="TroveProperty__OptionDropdownExplainer">
                Select an option or create one
              </div>
              {options.filter(optionFilter).map((o, i) => {
                return (
                  <div
                    className="TroveProperty__PillRow"
                    key={o.id}
                    onClick={(e) => handleSelectItem(e, o)}
                    style={i === optionIdx ? { backgroundColor: '#EEEEED' } : {}}
                  >
                    {renderPill(o, false, 'TrovePill--nowrap')}
                  </div>
                );
              })}
              {showNewOption && (
                <div
                  className="TroveProperty__PillRow"
                  key="create"
                  onClick={(e) => handleSelectItem(e, newOption)}
                  style={
                    optionIdx === options.filter(optionFilter).length
                      ? { backgroundColor: '#EEEEED' }
                      : {}
                  }
                >
                  <div className="TroveProperty__CreateTopic">Create</div>
                  {renderPill(newOption, false, 'TrovePill--nowrap')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectProperty;
