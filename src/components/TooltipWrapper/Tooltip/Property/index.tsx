import React from 'react';
import { AnyPropertyUpdateData } from '../../../../app/notionTypes/dbUpdate';
import { SchemaPropertyType, SchemaValue } from '../../../../app/notionTypes/schema';
import CheckboxProperty from './CheckboxProperty';
import InputProperty from './InputProperty';
import PersonProperty from './PersonProperty';
import ReadOnlyPersonProperty from './ReadOnlyPersonProperty';
import ReadOnlyTimeProperty from './ReadOnlyTimeProperty';
import SelectProperty from './SelectProperty';

interface PropertyProps {
  property: SchemaValue;
  root: ShadowRoot;
  updateProperty: (
    propertyId: string,
    type: SchemaPropertyType,
    data: AnyPropertyUpdateData,
  ) => void;
}

export default function Property({ property, root, updateProperty }: PropertyProps) {
  switch (property.type) {
    case SchemaPropertyType.Text:
    case SchemaPropertyType.Number:
    case SchemaPropertyType.Email:
    case SchemaPropertyType.PhoneNumber:
    case SchemaPropertyType.Url:
      return <InputProperty property={property} root={root} updateProperty={updateProperty} />;
    case SchemaPropertyType.Select:
    case SchemaPropertyType.MultiSelect:
      return <SelectProperty property={property} root={root} updateProperty={updateProperty} />;
    case SchemaPropertyType.Checkbox:
      return <CheckboxProperty property={property} updateProperty={updateProperty} />;
    case SchemaPropertyType.CreatedTime:
    case SchemaPropertyType.LastEditedTime:
      return <ReadOnlyTimeProperty property={property} />;
    case SchemaPropertyType.CreatedBy:
    case SchemaPropertyType.LastEditedBy:
      return <ReadOnlyPersonProperty property={property} />;
    case SchemaPropertyType.Person:
      return <PersonProperty property={property} root={root} updateProperty={updateProperty} />;
    case SchemaPropertyType.Title:
      return null;
    default:
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
          <div className="TroveProperty__ReadOnlyWrapper--ReadOnly">
            <div className="TroveProperty__SelectReadOnlyWrapper">Not supported</div>
          </div>
        </div>
      );
  }
}
