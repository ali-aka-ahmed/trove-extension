import { LoadingOutlined } from '@ant-design/icons';
import React from 'react';
import '../style.scss';
import './style.scss';

interface ButtonProps {
  disabled?: boolean,
  icon?: React.ReactNode,
  label?: string,
  className?: string,
  loading?: boolean,
  onClick: ((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => Promise<void> | void),
  onMouseOut?: ((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => Promise<void> | void),
  onMouseOver?: ((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => Promise<void> | void),
  size?: 'fit' | 'fill',
  style?: object,
  type?: 'primary' | 'secondary',
}

const Button = ({ 
  disabled=false, 
  icon, 
  label, 
  loading,
  onClick, 
  className='',
  onMouseOut=( () => {} ),
  onMouseOver=( () => {} ),
  size='fit',
  style={}, 
  type='primary', 
}: ButtonProps) => {
  const sizeStyle = size === 'fill' ? { minWidth: '100%', minHeight: '100%' } : {}
  const disabledPrimaryStyle = { cursor: 'not-allowed', opacity: 0.7 };
  const disabledSecondaryStyle = { cursor: 'not-allowed', opacity: 0.7, backgroundColor: '#dddddd' };
  const disabledStyle = type === 'primary' ? disabledPrimaryStyle : disabledSecondaryStyle
  const customStyle = {...style, ...disabledStyle, ...sizeStyle};
  
  const handleClick = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { 
    if (disabled) return;
    await onClick(e); 
  };

  const handleMouseOver = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { 
    if (disabled) return;
    await onMouseOver(e);
  };

  const handleMouseOut = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { 
    if (disabled) return;
    await onMouseOut(e) ;
  };

  return (
    <div
      className={`${className} TbdLibButton TbdLibButton--${type}`}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      style={customStyle}
    >
      {loading && <div className="TbdLibButton__Loading"><LoadingOutlined /></div>}
      {label && icon && <div className="TbdLibButton__Icon">{icon}</div>}
      <button
        className="TbdLibButton__Button"
        disabled={disabled}
        style={disabled ? disabledStyle : {}}
      >
        {label ? label : icon}
      </button>
    </div>
  )
}

export default Button