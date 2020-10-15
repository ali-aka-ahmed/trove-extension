import { api, BaseRes } from '.';
import INotification from '../models/INotification';
import { get } from '../utils/chrome/storage';

export const getNotifications = async (): Promise<NotificationsRes> => {
  const args: GetNotificationsReqBody = { userId: (await get('user')).user.id };
  return await api.post('/notifications/', args);
}

/**
 * POST /
 */
export interface GetNotificationsReqBody {
  userId: string;
}

/**
 * POST /
 */
export type NotificationsRes = {
  notifications?: INotification[];
} & BaseRes;