import IUser from '../../models/IUser';

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
  Exists = 'EXISTS',
  Login = 'LOGIN',
}
