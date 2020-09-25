import { BaseParams, BaseRes } from '.';
import { User } from '../nodes/User';

/**
 * ROUTES
 *
 * GET /:id
 * POST /:id/update
 */

/** ************************* */
/** ********** REQ ********** */
/** ************************* */

/**
 * GET /:id
 * @interface GetUserReqParams
 */
export interface GetUserReqParams extends BaseParams {
  id: string;
}

/**
 * POST /:id/update
 * @interface UpdateUserReqBody
 */
export interface UpdateUserReqBody {
  color?: string; // Hex code
  displayName?: string;
  email?: string; // either email, or phoneNumber
  phoneNumber?: number;
  username?: string; // alphanum and underscores, 3 < username < 20 characters
}

/**
 * POST /:id/update
 * @interface UpdateUserReqParams
 */
export interface UpdateUserReqParams extends BaseParams {
  id: string;
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * GET /:id
 * POST /:id/update
 * @interface UserRes
 */
export interface UserRes extends BaseRes {
  user?: User;
}
