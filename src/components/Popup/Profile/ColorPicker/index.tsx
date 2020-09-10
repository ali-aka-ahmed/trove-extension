import React from 'react';
import '../style.scss';
import './style.scss';

interface ColorPickerProps {
  currColor: string;
  onSelect: ( (hex: string) => Promise<void> | void );
}

const ColorPicker = ({ currColor, onSelect }: ColorPickerProps) => {
	return (
    <div className='TbdColorPicker'>
      <div className='TbdColorPicker__top-row'>
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#FF6900'}} 
          onClick={() => onSelect('#FF6900')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#FCB900'}} 
          onClick={() => onSelect('#FCB900')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#7BDCB5'}} 
          onClick={() => onSelect('#7BDCB5')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#00D084'}} 
          onClick={() => onSelect('#00D084')}
        />
        <div
          className='TbdColorPicker__color-option' 
          style={{color: '#8ED1FC'}} 
          onClick={() => onSelect('#8ED1FC')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#0693E3'}} 
          onClick={() => onSelect('#0693E3')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#ABB8C3'}} 
          onClick={() => onSelect('#ABB8C3')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#EB144C'}} 
          onClick={() => onSelect('#EB144C')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#F78DA7'}} 
          onClick={() => onSelect('#F78DA7')}
        />
        <div 
          className='TbdColorPicker__color-option'
          style={{color: '#9900EF'}} 
          onClick={() => onSelect('#9900EF')}
        />
      </div>
    </div>
	)
};

export default ColorPicker;