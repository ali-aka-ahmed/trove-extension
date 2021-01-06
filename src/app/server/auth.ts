import { api, AxiosRes, BaseRes } from '.';
import IUser from '../../models/IUser';

export type IAuthRes = AuthRes & AxiosRes;

export const login = async (args: LoginReqBody): Promise<IAuthRes> => {
  return await api.post('/auth/login', args);
}

export const forgotPassword = async (args: ForgotReqBody): Promise<AxiosRes> => {
  return await api.post('/auth/forgot', args)
}

/**
 * POST /auth/login
 */
export interface LoginReqBody {
  email?: string; // either email, phoneNumber or username
  phoneNumber?: string; // include country code ex. 13017872508
  username?: string;
  password: string;
}

/**
 * POST /auth/forgot
 */
export interface ForgotReqBody {
  email?: string; // email or phoneNumber
  phoneNumber?: string; // include country code ex. 13017872508
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /auth/signup
 * POST /auth/login
 * POST /auth/reset/:token
 */
type AuthRes = {
  user?: IUser;
  token?: string;
} & BaseRes;
