import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import User from '../../../../entities/User';
import { isOsKeyPressed } from '../helpers/os';
import Dropdown from './Dropdown';
import { getSuggestedUsers } from './helpers';

interface EditorProps {
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  outsideRef: React.MutableRefObject<HTMLTextAreaElement | undefined>;
  setText: React.Dispatch<React.SetStateAction<string>>;
  submit: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined) => Promise<void>;
  value: string;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function TextareaEditor({
  onChange,
  outsideRef,
  setText,
  submit,
  value,
  placeholder,
  autoFocus,
}: EditorProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  useEffect(() => {
    if (autoFocus && outsideRef) {
      const selectionIdx = value.length;
      outsideRef.current?.setSelectionRange(selectionIdx, selectionIdx)
    }
  }, [autoFocus, outsideRef])

  useEffect(() => {
    outsideRef.current?.focus();
  }, []);

  const stopPropagation = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    onChange(e);
    getSuggestedUsers(e.target).then((users) => setSuggestedUsers(users));
  };

  const handleOnClick = async (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
    e.stopPropagation();
    getSuggestedUsers(e.target as HTMLTextAreaElement).then((users) => setSuggestedUsers(users));
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement> | KeyboardEvent) => {
    e.stopPropagation();
    if (isOsKeyPressed(e) && (e.which === 13 || e.key === '\n')) {
      // Submit current post
      e.preventDefault();
      submit();
    }
  };

  useEffect(() => {
    outsideRef.current?.addEventListener('keydown', onKeyPress, false)
    return () => { outsideRef.current?.removeEventListener('keydown', onKeyPress, false) }
  }, [outsideRef.current, onKeyPress])

  return (
    <>
      <TextareaAutosize
        className="TroveTooltip__Editor"
        onChange={handleOnChange}
        onClick={handleOnClick}
        onKeyPress={onKeyPress}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        value={value}
        placeholder={placeholder || "Write something..."}
        // @ts-ignore
        ref={outsideRef}
      />
      {suggestedUsers && (
        <Dropdown data={suggestedUsers} textareaRef={outsideRef} setText={setText} />
      )}
    </>
  );
}
