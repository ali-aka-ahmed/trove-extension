import { BaseParams, BaseRes } from '.';
import IUser from '../entities/IUser';

/**
 * ROUTES for /auth
 *
 * POST /signup
 * POST /login
 * POST /forgot
 * POST /reset/:token
 * POST /username
 */

/** ************************* */
/** ********** REQ ********** */
/** ************************* */

/**
 * POST /signup
 */
export interface SignupReqBody {
  color: string;
  displayName: string;
  nominatorId: string;
  password: string;
  username: string;
  email?: string; // either email or phoneNumber
  phoneNumber?: number; // include country code ex. 13017872508
}

/**
 * POST /login
 */
export interface LoginReqBody {
  email?: string; // either email, phoneNumber or username
  phoneNumber?: number; // include country code ex. 13017872508
  username?: string;
  password: string;
}

/**
 * POST /forgot
 */
export interface ForgotReqBody {
  email?: string; // email or phoneNumber
  phoneNumber?: number; // include country code ex. 13017872508
}

/**
 * POST /reset/:token
 */
export interface ResetReqBody {
  password: string;
}

/**
 * POST /reset/:token
 */
export interface ResetReqParams extends BaseParams {
  token: string;
}

/**
 * POST /username
 */
export interface UsernameReqBody {
  username: string;
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /signup
 * POST /login
 * POST /forgot
 * POST /reset/:token
 */
export type AuthRes = {
  user?: IUser;
  token?: string;
} & BaseRes;

/**
 * POST /username
 */
export type UsernameRes = {
  exists?: boolean;
} & BaseRes;
