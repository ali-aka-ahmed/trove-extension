import { EditOutlined } from '@ant-design/icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ChromePicker } from 'react-color';
import './style.scss';

interface ColorPickerProps {
  defaultColor: string;
  onSelect: ( (hex: string) => Promise<void> | void );
}

export default function ColorPicker({ onSelect, defaultColor }: ColorPickerProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [color, setColor] = useState(defaultColor);

  const onEnter = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSelect(color);
      setColorPickerOpen(false);
    }
  }, [color])
  
  const toggleColorPicker = () => {
    if (colorPickerOpen) {
      onSelect(color)
      setColorPickerOpen(false)
    } else setColorPickerOpen(true)
  }

  useEffect(() => {
    window.addEventListener("keypress", onEnter);
    console.log('addlistener')
    return () => { window.removeEventListener("keypress", onEnter) }
  }, [colorPickerOpen, onEnter])
  
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
      <div
        className="TbdProfile__ColorPreview" 
        style={colorPickerOpen ? { backgroundColor: color } : { backgroundColor: '#FFFFFF'}}
        onClick={toggleColorPicker}
      >
        <EditOutlined />
      </div>
      {colorPickerOpen && (
        <div className="ColorPicker__ColorPickerWrapper" id="ColorPicker__ColorPickerWrapper">
          <ChromePicker
            color={color}
            onChange={(v: any) => setColor(v.hex)}
            disableAlpha={true}
          />
        </div>
      )}
    </div>
	)
};