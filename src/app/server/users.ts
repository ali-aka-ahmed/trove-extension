import { api, AxiosRes, BaseParams, BaseRes } from '.';
import IUser from '../../models/IUser';
import { get } from '../../utils/chrome/storage';

export type IUsersRes = UsersRes & AxiosRes;
export type IUserRes = UserRes & AxiosRes;

export const handleUserSearch = async (searchText: string): Promise<IUsersRes> => {
  const args: GetUsersReqBody = { text: searchText }
  return await api.post(`/users`, args);
}

export const getUser = async (id: string): Promise<IUserRes> => {
  const params: UserReqParams = { id }
  return await api.get(`/users/${params.id}`);
}

export const updateUser = async (args: UpdateUserReqBody): Promise<IUserRes> => {
  const params: UserReqParams = { id: (await get('user')).user.id };
  return await api.post(`/users/${params.id}/update`, args);
}

/**
 * POST /users/
 */
interface GetUsersReqBody {
  text: string;
}

/**
 * POST /users/:id/update
 */
export interface UpdateUserReqBody {
  color?: string; // Hex code
  displayName?: string;
  email?: string; // either email, or phoneNumber
  phoneNumber?: string;
  username?: string; // alphanum and underscores, 3 < username < 20 characters
}

/**
 * GET /users/:id
 * POST /users/:id/update
 */
interface UserReqParams extends BaseParams {
  id: string;
}

/**
 * POST /users/
 */
type UsersRes = {
  users: IUser[];
} & BaseRes;

/**
 * GET /users/:id
 * POST /users/:id/update
 */
type UserRes = {
  user?: IUser;
} & BaseRes;
