import { BaseParams, BaseRes } from '.';
import { Notification } from '../nodes/Notification';

/**
 * ROUTES
 *
 * POST /
 */

/** ************************* */
/** ********** REQ ********** */
/** ************************* */

/**
 * POST /
 */
export interface GetNotificationsReqBody extends BaseParams {
  userId: string;
}

/**
 * GET /:id
 */
export interface GetNotificationReqParams extends BaseParams {
  id: string;
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /
 */
export type NotificationsRes = {
  notifications?: Notification[];
} & BaseRes;

/**
 * GET /:id
 */
export type NotificationRes = {
  notification?: Notification;
} & BaseRes;
