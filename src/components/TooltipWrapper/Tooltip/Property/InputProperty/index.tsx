import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnyPropertyUpdateData } from '../../../../../app/notionTypes/dbUpdate';
import {
  EmailProperty,
  NumberProperty,
  PhoneNumberProperty,
  SchemaPropertyType,
  TextProperty,
  UrlProperty,
} from '../../../../../app/notionTypes/schema';
import { MessageType, sendMessageToExtension } from '../../../../../utils/chrome/tabs';

interface InputPropertyProps {
  property: TextProperty | NumberProperty | EmailProperty | PhoneNumberProperty | UrlProperty;
  root: ShadowRoot;
  updateProperty: (
    propertyId: string,
    type: SchemaPropertyType,
    data: AnyPropertyUpdateData,
  ) => void;
}

export default function InputProperty({ property, root, updateProperty }: InputPropertyProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(property.value || '');
  const [mouseOverLinkType, setMouseOverLinkType] = useState(false);
  const propertyInput = useRef<HTMLInputElement>(null!);
  const linkTypes = [
    SchemaPropertyType.Email,
    SchemaPropertyType.PhoneNumber,
    SchemaPropertyType.Url,
  ];

  useEffect(() => {
    updateProperty(property.propertyId, property.type, inputValue);
  }, [inputValue]);

  const handleLinkClick = (type: SchemaPropertyType, href: string) => {
    let url = href;
    if (type === SchemaPropertyType.Email) url = `mailto:${href}`;
    else if (type === SchemaPropertyType.PhoneNumber) url = `tel:${href}`;
    sendMessageToExtension({ type: MessageType.OpenTab, active: true, url });
  };

  const handleClickOutsidePropertyInput = useCallback(
    (e: MouseEvent) => {
      const input = propertyInput.current;
      // if you click outside of the input and nothing is selected
      const somethingIsSelected =
        input.selectionStart !== input.selectionEnd && root.activeElement === input;
      if (input !== e.target && !somethingIsSelected) {
        e.preventDefault();
        setInputValue(cleanInput(property.type, inputValue));
        setEditing(false);
      }
    },
    [inputValue, propertyInput],
  );

  useEffect(() => {
    if (editing) root.addEventListener('click', handleClickOutsidePropertyInput);
    return () => root.removeEventListener('click', handleClickOutsidePropertyInput);
  }, [editing, handleClickOutsidePropertyInput]);

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      setInputValue(cleanInput(property.type, inputValue));
      setEditing(false);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setInputValue('');
      setEditing(false);
    }
  };

  const cleanInput = (type: SchemaPropertyType, val: string) => {
    if (type === SchemaPropertyType.Number) return val.replace(/\D/g, '');
    return inputValue;
  };

  return (
    <div className="TroveProperty__Property" key={property.propertyId}>
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
        <div className="TroveProperty__ReadOnlyWrapper">
          {/* READ ONLY */}
          <div
            className="TroveProperty__ReadOnlyInputTypeWrapper"
            onMouseEnter={() => setMouseOverLinkType(true)}
            onMouseLeave={() => setMouseOverLinkType(false)}
            onClick={() => setEditing(true)}
          >
            <div
              className={`
                ${
                  linkTypes.includes(property.type) && inputValue
                    ? 'TroveProperty__LinkReadOnly'
                    : ''
                }
                TroveProperty__PropertyValue
              `}
              style={inputValue ? { color: 'rgb(55, 53, 47)' } : {}}
            >
              {inputValue ? inputValue : 'Empty'}
            </div>
            {/* FLOATING GO TO LINK BUTTON */}
            {mouseOverLinkType && inputValue && linkTypes.includes(property.type) && (
              <div
                onClick={() => handleLinkClick(property.type, inputValue)}
                className="TroveProperty__LinkIconWrapper"
              >
                <div className="TroveProperty__LinkIcon">
                  <img
                    src={chrome.extension.getURL(`images/notion/properties/${property.type}.png`)}
                    className="TroveProperty__PropertyImg"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="TroveProperty__EditorWrapper">
          {/* EDITOR */}
          <div className="TroveProperty__InputWrapper">
            <input
              className="TroveProperty__Input"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => handleOnKeyDown(e)}
              ref={propertyInput}
            />
          </div>
        </div>
      )}
    </div>
  );
}
