import { CheckCircleTwoTone, CloseCircleTwoTone, EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import React, { forwardRef, useEffect, useState } from 'react';
import '../style.scss';
import './style.scss';

type InputProps = {
  autofocus?: boolean;
  className?: string;
  disabled?: boolean;
  helpTooltip?: any;
  id?: string;
  isPassword?: boolean;
  label?: string;
  onBlur?: ((event: React.FocusEvent<HTMLInputElement>) => Promise<void> | void);
  onChange?: ((event: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void);
  onFocus?: ((event: React.FocusEvent<HTMLInputElement>) => Promise<void> | void);
  onPressEnter?: ((text: string) => Promise<void> | void);
  placeholder?: string;
  showValidation?: boolean;
  size?: 'fit' | 'fill';
  style?: object;
  validation?: 'error' | 'success' | 'loading';
  validationError?: string;
  value?: string;
}

type InputRef = HTMLInputElement;

const Input = forwardRef<InputRef, InputProps>(({
  autofocus=false,
  className='',
  disabled=false,
  helpTooltip,
  id,
  isPassword,
  label,
  onBlur=( () => {} ),
  onChange=( () => {} ),
  onFocus=( () => {} ),
  onPressEnter=( () => {} ),
  placeholder='', 
  showValidation,
  size='fit',
  style={},
  validation,
  validationError,
  value
}, ref) => {
  const [input, setInput] = useState(value ? value : '');
  const [cursor, setCursor] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (value !== undefined) setInput(value);
  }, [value])

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setCursor(e.target.selectionStart);
    if (value === undefined) setInput(e.target.value);
    await onChange(e);
  };

  const handleFocus = async (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.selectionStart = cursor;
    await onFocus(e);
  };
  
  const handleSubmit = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (value === undefined) setInput('');
    const tempInput = input;
    await onPressEnter(tempInput);
  }

  const toggleShowPassword = () => { setShowPassword(!showPassword) };

  const sizeStyle = size === 'fill' ? { minWidth: '100%' } : {};
  const customStyle = {...style, ...sizeStyle};
  
  let inputWrapperModifier = 'TbdLibInput--regular';
  let inputModifier = 'TbdLibInput__Input--regular';
  if (disabled) {
    inputWrapperModifier = 'TbdLibInput--disabled';
    inputModifier = 'TbdLibInput__Input--disabled';
  } else if (showValidation && validation === 'error' && validationError) {
    inputWrapperModifier = 'TbdLibInput--error';
  }
  
  return (
    <>
      <div
        style={customStyle}
        className={`${className} TbdLibInput ${inputWrapperModifier}`}
      >
        {label && (
          <div className="TbdLibInput__LabelWrapper">
            {label}
            {helpTooltip && <div className="TbdLibInput__Tooltip">{helpTooltip}</div>}
          </div>
        )}
        <div className="TbdLibInput__InputWrapper">
          <input
            id={id}
            className={`TbdLibInput__Input ${inputModifier}`}
            type={isPassword && !showPassword ? 'password' : 'text'}
            placeholder={placeholder}
            disabled={disabled}
            ref={ref}
            onFocus={handleFocus}
            autoFocus={autofocus}
            value={input}
            onChange={handleChange}
            onBlur={onBlur}
            onKeyDown={(e) => { if (e.keyCode === 13) handleSubmit(e) }}
            style={label ? {...style, paddingTop: 0 } : style}
          />
          {isPassword && (
            <div className="TbdLibInput__Password" onClick={toggleShowPassword}>
              {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
            </div>
          )}
          {showValidation && validation && (
            <div className="TbdLibInput__Validation">
              {validation === 'success' && <CheckCircleTwoTone twoToneColor="#00C781" />}
              {validation === 'error' && <CloseCircleTwoTone twoToneColor="#FF4040" />}
              {validation === 'loading' && <LoadingOutlined />}
            </div>
          )}
        </div>
      </div>
      {showValidation && validation === 'error' && validationError && (
        <div className="TbdLibInput__ValidationError">{validationError}</div>
      )}
    </>
  )
})

export default Input