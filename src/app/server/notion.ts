import { getCookie } from '../../utils/chrome/cookies';

export const getPageNames = (limit?: number): string[] => {
  // sendMessageToExtension({ type: MessageType.GetNotionAuthToken }).then((res) => {
  //   if (!res) {
  //     console.error('User is not logged into Notion.')
  //   }

  // });
  return ['Investing', 'Politics', 'Read later'];
};

export const getPageNamesByPrefix = (prefix: string, limit?: number): string[] => {
  // sendMessageToExtension({ type: MessageType.GetNotionAuthToken }).then((res) => {
  //   if (!res) {
  //     console.error('User is not logged into Notion.')
  //   }

  // });
  return [`${prefix} 1`, `${prefix} 2`, `${prefix} 3`];
};

export const getNotionAuthToken = () => {
  return getCookie('https://www.notion.so', 'token_v2');
};
