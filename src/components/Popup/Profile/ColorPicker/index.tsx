import React from 'react';
import '../style.scss';
import './style.scss';

interface ColorPickerProps {
  onSelect: ( (hex: string) => Promise<void> | void );
}

const ColorPicker = ({ onSelect }: ColorPickerProps) => {
	return (
    <div className="TbdColorPicker">
      <div 
        className="TbdProfile__ColorPreview"
        style={{backgroundColor: '#FF6900'}} 
        onClick={() => onSelect('#FF6900')}
      />
      <div 
        className="TbdProfile__ColorPreview"
        style={{backgroundColor: '#FCB900'}} 
        onClick={() => onSelect('#FCB900')}
      />
      <div 
        className="TbdProfile__ColorPreview"
        style={{backgroundColor: '#00D084'}} 
        onClick={() => onSelect('#00D084')}
      />
      <div
        className="TbdProfile__ColorPreview" 
        style={{backgroundColor: '#8ED1FC'}} 
        onClick={() => onSelect('#8ED1FC')}
      />
      <div 
        className="TbdProfile__ColorPreview"
        style={{backgroundColor: '#0693E3'}} 
        onClick={() => onSelect('#0693E3')}
      />
      <div 
        className="TbdProfile__ColorPreview"
        style={{backgroundColor: '#EB144C'}} 
        onClick={() => onSelect('#EB144C')}
      />
      <div 
        className="TbdProfile__ColorPreview"
        style={{backgroundColor: '#F78DA7'}} 
        onClick={() => onSelect('#F78DA7')}
      />
      <div 
        className="TbdProfile__ColorPreview"
        style={{backgroundColor: '#9900EF'}} 
        onClick={() => onSelect('#9900EF')}
      />
    </div>
	)
};

export default ColorPicker;