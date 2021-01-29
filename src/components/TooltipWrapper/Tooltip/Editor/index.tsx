import { Delta, Sources } from 'quill';
import React, { useEffect } from 'react';
import ReactQuill, { UnprivilegedEditor } from 'react-quill';

interface EditorProps {
  onChange: (content: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => void;
  outsideRef: React.MutableRefObject<ReactQuill | null>;
  root: ShadowRoot;
  value: string;
}

export default function Editor(props: EditorProps) {
  useEffect(() => {
    props.outsideRef.current?.focus();
  }, []);

  // TODO: doesn't work on text with newlines bc newlines are translated to <br> by react-quill
  const getEditorIndex = () => {
    const selection = props.root.getSelection()!;
    if (!selection.isCollapsed || selection.type.toLowerCase() === 'range') return -1;

    const children = props.root.activeElement?.children;
    if (children && children.length > 0) {
      const range = props.root.ownerDocument.createRange();
      range.setStart(children[0], 0);
      range.setEnd(selection.focusNode!, selection.focusOffset);
      console.log(range.toString());
      return range.toString().length;
    }

    return 0;
  };

  const onChange = (content: string, delta: Delta, source: Sources, editor: UnprivilegedEditor) => {
    props.onChange(content, delta, source, editor);

    // console.log(
    //   editor,
    //   editor.getBounds(0, 1),
    //   editor.getContents(),
    //   editor.getHTML(),
    //   editor.getLength(),
    //   editor.getSelection(),
    //   editor.getText(),
    // );
    // console.log(props.root.getSelection());

    // console.log(document.getElementsByClassName('TroveTooltip__Editor'));
    // console.log(props.root.ownerDocument.getElementsByClassName('TroveTooltip__Editor'));
    // console.log(props.root.activeElement?.children);
    // console.log(props.root.children);

    console.log(getEditorIndex());

    // getSelection()!.modify('extend', 'backward', 'word');
    // getSelection()!.modify('extend', 'backward', 'word');
    // getSelection()!.modify('extend', 'backward', 'word');
    // console.log(getSelection()!.toString());
  };

  // useEffect(() => {
  //   try {
  //     props.root.addEventListener('onselectionchange', test);
  //   } catch {}
  //   return () => {
  //     try {
  //       props.root.removeEventListener('onselectionchange', test);
  //     } catch {}
  //   };
  // }, [test]);

  const stopPropagation = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
  };

  // useEffect(() => {
  //   const ele = props.root.querySelector('.ql-editor')!;
  //   ele.addEventListener('keypress', onKeyPress);
  //   return () => ele.removeEventListener('keypress', onKeyPress);
  // }, [onKeyPress]);

  return (
    <ReactQuill
      className="TroveTooltip__Editor"
      theme="bubble"
      value={props.value}
      onChange={onChange}
      onKeyPress={stopPropagation}
      onKeyDown={stopPropagation}
      onKeyUp={stopPropagation}
      placeholder="Write something..."
      ref={props.outsideRef}
    />
  );
}
