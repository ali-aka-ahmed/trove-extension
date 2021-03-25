import React, { useEffect, useState } from 'react';
import { AnyPropertyUpdateData } from '../../../../../app/notionTypes/dbUpdate';
import { CheckboxProperty, SchemaPropertyType } from '../../../../../app/notionTypes/schema';

interface CheckboxPropertyProps {
  property: CheckboxProperty;
  updateProperty: (
    propertyId: string,
    type: SchemaPropertyType,
    data: AnyPropertyUpdateData,
  ) => void;
}

export default function CheckboxProperty({ property, updateProperty }: CheckboxPropertyProps) {
  const [checked, setChecked] = useState(property.value === 'Yes');

  useEffect(() => {
    const submitVal: 'Yes' | 'No' = checked ? 'Yes' : 'No';
    updateProperty(property.propertyId, property.type, submitVal);
  }, [checked]);

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
      <div className="TroveProperty__ReadOnlyWrapper">
        <div
          className="TroveProperty__Checkbox"
          onClick={() => {
            if (checked) setChecked(false);
            else setChecked(true);
          }}
        >
          <div
            className={`
            TroveProperty__CheckboxInterior
            ${checked ? 'TroveProperty__CheckboxInteriorChecked' : ''}
          `}
          >
            <img
              style={checked ? { width: '11px' } : { width: '13px' }}
              src={chrome.extension.getURL(
                `images/notion/properties/${
                  checked ? 'checkbox_checked' : 'checkbox_unchecked'
                }.png`,
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
