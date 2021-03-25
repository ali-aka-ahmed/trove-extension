import { PlayCircleFilled } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { AnyPropertyUpdateData } from '../../../../app/notionTypes/dbUpdate';
import { SchemaPropertyType } from '../../../../app/notionTypes/schema';

interface TitleProps {
  existingTitle?: string;
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  updateProperty: (
    propertyId: string,
    type: SchemaPropertyType,
    data: AnyPropertyUpdateData,
  ) => void;
}

const Title = ({ existingTitle, updateProperty, setCollapsed, collapsed }: TitleProps) => {
  const [title, setTitle] = useState(existingTitle || '');

  useEffect(() => {
    if (title !== existingTitle) updateProperty('title', SchemaPropertyType.Title, title);
  }, [title]);

  return (
    <div className="TroveTitleWrapper">
      <div className="TroveTitle__CollapseButtonWrapper">
        <button
          className="TroveDropdown__CollapseButton"
          onClick={() => setCollapsed(!collapsed)}
          style={collapsed ? { transform: 'rotateZ(-90deg)' } : { transform: 'rotateZ(90deg)' }}
        >
          <PlayCircleFilled />
        </button>
      </div>
      <TextareaAutosize
        className="TroveTooltip__Title"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        placeholder="Untitled"
        disabled={!!existingTitle}
        style={collapsed ? { border: '0' } : {}}
      />
    </div>
  );
};

export default Title;
