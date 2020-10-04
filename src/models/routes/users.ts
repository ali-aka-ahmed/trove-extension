import { BaseParams, BaseRes } from '.';
import { User } from '../entities/User';

/**
 * ROUTES for /users
 *
 * POST /
 * GET /:id
 * POST /:id/update
 */

/** ************************* */
/** ********** REQ ********** */
/** ************************* */

/**
 * POST /
 */
export interface GetUsersReqBody {
  username: string;
}

/**
 * GET /:id
 */
export interface GetUserReqParams extends BaseParams {
  id: string;
}

/**
 * POST /:id/update
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
 */
export interface UpdateUserReqParams extends BaseParams {
  id: string;
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /
 */
export type UsersRes = {
  users?: User[];
} & BaseRes;

/**
 * GET /:id
 * POST /:id/update
 */
export type UserRes = {
  user?: User;
} & BaseRes;
