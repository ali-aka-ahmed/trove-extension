import { ORIGIN, VALID_DOMAINS } from '../../config';
import IUser from '../../models/IUser';
import { getAllTabs } from './tabs';

/**
 * Typing for messages sent from website to extension.
 * Make sure the same values exist in the extension.
 */
export interface Message {
  type: MessageType;
  token?: string;
  user?: IUser;
}

/**
 * MessageTypes for message sent from website to extension.
 * Make sure we have the same values in the extension.
 */
export enum MessageType {
  IsAuthenticated = 'IS_AUTHENTICATED',
  Exists = 'EXISTS',
  Login = 'LOGIN',
  Logout = 'LOGOUT',
  UpdateProfile = 'UPDATE_PROFILE',
}

export const sendMessageToWebsite = (message: Message) => {
  getAllTabs().then((tabs) => {
    tabs.forEach((tab) => {
      const domain = new URL(tab.url!).hostname
      const tabId = tab.id!
      if (VALID_DOMAINS.includes(domain)) {
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
  });
};
