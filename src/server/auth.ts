import { api, AxiosRes, BaseParams, BaseRes } from '.';
import IUser from '../models/IUser';

type IAuthRes = AuthRes & AxiosRes;
type IUsernameRes = UsernameRes & AxiosRes;

export const signup = async (args: SignupReqBody): Promise<IAuthRes> => {
  return await api.post(`/auth/signup`, args);
};

export const login = async (args: LoginReqBody): Promise<IAuthRes> => {
  return await api.post(`/auth/login`, args);
}

export const forgotPassword = async (args: ForgotReqBody): Promise<IAuthRes> => {
  return await api.post(`/auth/forgot`, args)
}

export const checkValidUsername = async (username: string): Promise<IUsernameRes> => {
  const args: UsernameReqBody = { username }
  return await api.post(`/auth/username`, args);
}

/**
 * POST /auth/signup
 */
interface SignupReqBody {
  color: string;
  displayName: string;
  nominatorId: string;
  password: string;
  username: string;
  email?: string; // either email or phoneNumber
  phoneNumber?: number; // include country code ex. 13017872508
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
interface ForgotReqBody {
  email?: string; // email or phoneNumber
  phoneNumber?: number; // include country code ex. 13017872508
}

/**
 * POST /auth/reset/:token
 */
interface ResetReqBody {
  password: string;
}

/**
 * POST /auth/reset/:token
 */
interface ResetReqParams extends BaseParams {
  token: string;
}

/**
 * POST /auth/username
 */
interface UsernameReqBody {
  username: string;
}

/**
 * POST /auth/signup
 * POST /auth/login
 * POST /auth/forgot
 * POST /auth/reset/:token
 */
type AuthRes = {
  user?: IUser;
  token?: string;
} & BaseRes;

/**
 * POST /auth/username
 */
type UsernameRes = {
  exists?: boolean;
} & BaseRes;
