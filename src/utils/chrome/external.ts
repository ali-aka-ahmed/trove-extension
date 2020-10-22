import { DOMAIN, ORIGIN } from '../../config';
import IUser from '../../models/IUser';
import { getAllTabs } from './tabs';

/**
 * Typing for messages sent from website to extension.
 */
export interface Message {
  type: MessageType;
  token?: string;
  user?: IUser;
}

/**
 * MessageTypes for message sent from website to extension.
 */
export enum MessageType {
  isAuthenticated = 'IS_AUTHENTICATED',
  Exists = 'EXISTS',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
}

export const sendMessageToWebsite = async (message: Message) => {
  const tabs = await getAllTabs()
  tabs.forEach((tab) => {
    const domain = new URL(tab.url!).hostname
    const tabId = tab.id!
    if (domain === DOMAIN) {
      chrome.tabs.executeScript(tabId, {
        code: '(' + ((args: { message: Message; origin: string; }) => {
          const message = args.message;
          const origin = args.origin;
          window.postMessage(message, origin)
          return { success: true };
        }) + ')(' + JSON.stringify({ message, origin: ORIGIN }) + ');'
      }, (results) => results);
    };
  });
};
