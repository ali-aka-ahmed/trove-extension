import React, { useEffect, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import User from '../../../../entities/User';
import Dropdown from '../Dropdown';
import { getSuggestedUsers } from './helpers';

interface EditorProps {
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  outsideRef: React.MutableRefObject<HTMLTextAreaElement | undefined>;
  root: ShadowRoot;
  setText: React.Dispatch<React.SetStateAction<string>>;
  value: string;
}

export default function TextareaEditor(props: EditorProps) {
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
    console.log(e.target.value);
    getSuggestedUsers(e.target).then((users) => setSuggestedUsers(users));
  };

  const onClick = async (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
    e.stopPropagation();
    getSuggestedUsers(e.target as HTMLTextAreaElement).then((users) => setSuggestedUsers(users));
  };

  return (
    <>
      <TextareaAutosize
        className="TroveTooltip__Editor"
        onChange={onChange}
        onClick={onClick}
        onKeyPress={stopPropagation}
        onKeyDown={stopPropagation}
        onKeyUp={stopPropagation}
        value={props.value}
        placeholder="Write something..."
        // @ts-ignore
        ref={props.outsideRef}
      />
      {suggestedUsers && (
        <Dropdown data={suggestedUsers} textareaRef={props.outsideRef} setText={props.setText} />
      )}
    </>
  );
}
