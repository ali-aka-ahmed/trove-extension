import User from '../../../../../entities/User';
import IUser from '../../../../../models/IUser';
import { MessageType, sendMessageToExtension } from '../../../../../utils/chrome/tabs';

export const getSuggestedUsers = (ta: HTMLTextAreaElement) => {
  const currWord = getCurrentWord(ta);
  const match = currWord.match(/^@[a-zA-Z0-9_]{1,20}/);
  if (match) {
    const prefix = match[0].slice(1);
    return getUsersByPrefix(prefix);
  }

  return Promise.resolve([]);
};

export const getCurrentWord = (ta: HTMLTextAreaElement) => {
  if (!ta || ta.selectionStart !== ta.selectionEnd) return '';

  // Find start
  let startIdx = Math.max(Math.min(ta.selectionStart - 1, ta.value.length - 1), 0);
  while (startIdx > 0) {
    if (ta.value[startIdx].match(/\s/)) {
      startIdx++;
      break;
    }

    startIdx--;
  }

  // Find end
  let endIdx = Math.max(ta.selectionStart, 0);
  while (endIdx < ta.value.length) {
    if (ta.value[endIdx].match(/\s/)) break;
    endIdx++;
  }

  return ta.value.slice(startIdx, endIdx);
};

const getUsersByPrefix = (prefix: string): Promise<User[]> => {
  try {
    return sendMessageToExtension({
      type: MessageType.HandleUserSearch,
      text: prefix,
    }).then((users: IUser[]) => users.map((user) => new User(user))) as Promise<User[]>;
  } catch (err) {
    return Promise.resolve([]);
  }
};
