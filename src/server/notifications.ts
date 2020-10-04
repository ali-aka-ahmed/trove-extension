
import api, { BaseParams, BaseRes } from '.';
import INotification from '../models/INotification';
import { get } from '../utils/chrome/storage';

export const getNotifications = async (): Promise<NotificationsRes> => {
  const args: GetNotificationsReqBody = { userId: (await get('user')).user.id };
  return await api.post('/notifications/', args);
}

export const getNotification = async (notificationId: string): Promise<NotificationRes> => {
  const params: GetNotificationReqParams = { id: notificationId };
  return await api.get(`/posts/${params.id}`);
}

/**
 * POST /
 */
export interface GetNotificationsReqBody {
  userId: string;
}

/**
 * GET /:id
 */
export interface GetNotificationReqParams extends BaseParams {
  id: string;
}

/**
 * POST /
 */
export type NotificationsRes = {
  notifications?: INotification[];
} & BaseRes;

/**
 * GET /:id
 */
export type NotificationRes = {
  notification?: INotification;
} & BaseRes;
