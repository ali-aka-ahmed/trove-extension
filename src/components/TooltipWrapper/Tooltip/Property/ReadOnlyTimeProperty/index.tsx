import moment from 'moment';
import React from 'react';
import { CreatedTimeProperty, LastEditedTimeProperty } from '../../../../../app/notionTypes/schema';

interface ReadOnlyPropertyProps {
  property: CreatedTimeProperty | LastEditedTimeProperty;
}

export default function ReadOnlyTimeProperty({ property }: ReadOnlyPropertyProps) {
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
      <div className="TroveProperty__ReadOnlyWrapper--ReadOnly">
        <div className="TroveProperty__ReadOnlyTypeWrapper">
          <div className="TroveProperty__PropertyValue" style={{ color: 'rgb(55, 53, 47)' }}>
            {moment(property.value || Date.now()).format('lll')}
          </div>
        </div>
      </div>
    </div>
  );
}
