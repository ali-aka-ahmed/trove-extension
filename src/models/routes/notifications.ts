import { BaseParams, BaseRes } from '.';
import INotification from '../entities/INotification';

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
  notifications?: INotification[];
} & BaseRes;

/**
 * GET /:id
 */
export type NotificationRes = {
  notification?: INotification;
} & BaseRes;
