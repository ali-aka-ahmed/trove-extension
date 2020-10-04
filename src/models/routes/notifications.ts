import { BaseParams, BaseRes } from '.';
import { Notification } from '../entities/Notification';

/**
 * ROUTES for /notifications
 *
 * POST /
 * GET /:id
 */

/** ************************* */
/** ********** REQ ********** */
/** ************************* */

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
