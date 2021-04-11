import User from '../entities/User';
import IUser from '../models/IUser';
import { get1 } from './chrome/storage';
import { MessageType, sendMessageToExtension } from './chrome/tabs';

export const analytics = async (
  eventName: string,
  user?: IUser | User | null,
  eventProperties?: object,
) => {
  const u = user || ((await get1('user')) as IUser);

  sendMessageToExtension({
    type: MessageType.Analytics,
    data: {
      userId: u.id,
      userTraits: {
        username: u.username,
      },
      eventName,
      eventProperties,
    },
  });
};
