import { debounce } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { ITopicsRes } from '../../../../app/server/topics';
import { DEFAULT_TOPIC_COLOR } from '../../../../constants';
import ITopic from '../../../../models/ITopic';
import { MessageType, sendMessageToExtension } from '../../../../utils/chrome/tabs';
import Pill from '../pill';

interface InputPillProps {
  onSubmit: (topic: ITopic) => Promise<void> | void;
  style?: object;
}

export default function InputPill({ onSubmit, style={} }: InputPillProps) {
  const [newTopic, setNewTopic] = useState<ITopic | null>(null);
  const [color, setNewColor] = useState(DEFAULT_TOPIC_COLOR);
  const [suggestedTopics, setSuggestedTopics] = useState<ITopic[]>([]);
  const [suggestedTopicsIdx, setSuggestedTopicsIdx] = useState(-1);
  const [content, setContent] = useState('');
  const [isInput, setIsInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onClickTopic = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setIsInput(true);
    setNewColor(DEFAULT_TOPIC_COLOR)
  }

  useEffect(() => {
    if (isInput) {
      (inputRef.current as HTMLInputElement).focus();
    }
  }, [isInput]);

  const onBlur = () => {
    const val = content.trim();
    if (val === '') setIsInput(false);
  }

  const onKeyDownContent = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    // console.log(e.key)
    e.stopPropagation();
    const showSuggestedTopics = suggestedTopics.length > 0 || newTopic !== null
    switch (e.key) {
      case 'ArrowUp': {
        if (showSuggestedTopics) {
          e.preventDefault();
          setSuggestedTopicsIdx(Math.max(-1, suggestedTopicsIdx - 1));
        }

        break;
      }
      case 'ArrowDown': {
        if (showSuggestedTopics) {
          e.preventDefault();
          const newIdx = Math.min(suggestedTopics.length - 1, suggestedTopicsIdx + 1);
          setSuggestedTopicsIdx(newIdx);
        }

        break;
      }
      case 'Enter': 
      case 'Tab': {
        if (showSuggestedTopics) {
          e.preventDefault();
          const topic = suggestedTopicsIdx === -1 ? newTopic : suggestedTopics[suggestedTopicsIdx];
          await selectSuggestedTopic(topic!);
        }

        break;
      }
      case 'Escape': {
        e.preventDefault();
        setContent('');
        setNewTopic(null);
        setSuggestedTopics([]);
        setSuggestedTopicsIdx(-1);
        setIsInput(false);
        break;
      }
    }
  }

  const selectSuggestedTopic = async (topic: ITopic) => {
    await onSubmit(topic);
    setContent('');
    setNewTopic(null)
    setSuggestedTopics([]);
    setSuggestedTopicsIdx(-1);
    setNewColor(DEFAULT_TOPIC_COLOR);
    setIsInput(false);
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
    if (e.target.value === '') {
      setNewTopic(null)
      setSuggestedTopicsIdx(-1)
      setSuggestedTopics([])
      setNewColor(DEFAULT_TOPIC_COLOR)
    } else await suggestTopics(e.target.value);
  }

  const suggestTopics = async (text: string) => {
    const debouncedSuggestTopics = debounce(async (text) => {
      await sendMessageToExtension({ type: MessageType.HandleTopicSearch, text: text.trim() }).then((res: ITopicsRes) => {
        if (!res.success) return;
        const normalizedText = text.trim().toLowerCase();
        const existingTopics = res.topics!;
        setSuggestedTopics(existingTopics);
        if (existingTopics.length === 0) setSuggestedTopicsIdx(-1);
        if (existingTopics.some((topic) => topic.normalizedText === normalizedText)) {
          setNewTopic(null);
          if (suggestedTopicsIdx === -1) setSuggestedTopicsIdx(0);
        }
      });    
    }, 0);

    await debouncedSuggestTopics(text);

    const normalizedText = text.trim().toLowerCase();
    if (suggestedTopics.some((topic) => topic.normalizedText === normalizedText)) {
      setNewTopic(null);
      if (suggestedTopicsIdx === -1) setSuggestedTopicsIdx(0);
    } else {
      const newTopic: ITopic = { 
        color,
        creationDatetime: Date.now(),
        lastEdited: Date.now(),
        id: uuid(),
        text: text.trim(),
        normalizedText, 
      };
      setNewTopic(newTopic) 
    }
  }

  const renderSuggestedTopics = () => {
    const renderTopic = (topic: ITopic, idx: number, showCreate: boolean = false) => {
      return (
        <button
          className={`TbdSuggestedTopicList__SuggestedTopic ${suggestedTopicsIdx === idx 
            ? 'TbdSuggestedTopicList__SuggestedTopic--selected' 
            : ''}`
          }
          key={topic.id}
          onMouseDown={() => setSuggestedTopicsIdx(idx)}
          onClick={() => selectSuggestedTopic(topic)}
        >
          {showCreate && (
            <div className="TbdSuggestedTopicList__FirstTopic">
              Create:
            </div>
          )}
          <Pill
            color={topic.color}
            text={topic.text}
            showClose={false}
          />
        </button>
      )
    }
    return (
      <div className="TbdNewPost__SuggestedTopicList">
        {newTopic && renderTopic(newTopic, -1, true)}
        {suggestedTopics.map((topic, idx) => renderTopic(topic, idx))}
      </div>
    )
  };

  if (!isInput) {
    return (
      <button className="TbdInputPill TbdInputPill--button" onClick={onClickTopic}>
        + Topic
      </button>
    )
  } else {
    return (
      <div className="TbdInputPill__Wrapper" style={style}>
        <input
          value={content}
          className="TbdInputPill TbdInputPill--input"
          style={{width: `${(content.length+1)*8}px`}}
          onChange={handleInputChange}
          onBlur={onBlur}
          onKeyDown={onKeyDownContent}
          ref={inputRef} 
        />
        {(suggestedTopics.length > 0 || newTopic !== null) && renderSuggestedTopics()}
      </div>
    );
  }
}
