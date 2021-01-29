import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import User from '../../../../entities/User';
import Dropdown from '../Dropdown';
import { getSuggestedUsers } from './helpers';

interface EditorProps {
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  value: string;
  outsideRef: React.MutableRefObject<HTMLTextAreaElement | undefined>;
  root: ShadowRoot;
}

export default function TextareaEditor(props: EditorProps) {
  const [onKeyDownDropdown, setOnKeyDownDropdown] = useState<
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  >(() => {});
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);

  useEffect(() => {
    props.outsideRef.current?.focus();
  }, []);

  const stopPropagation = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    props.onChange(e);

    getSuggestedUsers(e.target).then((users) => {
      console.log(users);
      setSuggestedUsers(users);
    });
  };

  const onClick = async (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
    e.stopPropagation();
    setSuggestedUsers(await getSuggestedUsers(e.target as HTMLTextAreaElement));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    onKeyDownDropdown(e);
  };

  const dropdownData = suggestedUsers || [];
  return (
    <>
      <TextareaAutosize
        className="TroveTooltip__Editor"
        onChange={onChange}
        onClick={onClick}
        onKeyPress={stopPropagation}
        onKeyDown={onKeyDown}
        onKeyUp={stopPropagation}
        value={props.value}
        placeholder="Write something..."
        // @ts-ignore
        ref={props.outsideRef}
      />
      {dropdownData && <Dropdown data={dropdownData} textareaRef={props.outsideRef} />}
    </>
  );
}
