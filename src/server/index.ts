import axios from 'axios';
import { AuthRes, ForgotReqBody, LoginReqBody, SignupReqBody, UsernameReqBody, UsernameRes } from '../models/routes/auth';
import { GetNotificationReqParams, GetNotificationsReqBody, NotificationRes, NotificationsRes } from '../models/routes/notifications';
import { CreatePostReqBody, GetPostReqParams, GetPostsReqBody, PostRes, PostsRes } from '../models/routes/posts';
import { GetUserReqParams, GetUsersReqBody, UpdateUserReqBody, UpdateUserReqParams, UserRes, UsersRes } from '../models/routes/users';
import { get } from '../utils/chrome/storage';

// FOR DEV
// 1. "http://localhost:5000/*" -> add to manifest.json for testing locally
// 2. Replace the token in the request interceptor with a token retrieved from Postman

const api = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    timeout: 2000,
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = (await get('token')).token;
  token ? config.headers.Authorization = `bearer ${token}` : null;
  return config;
});

api.interceptors.response.use((response) => {
  // (200-299)
  response.data.success = true;
  return response.data;
}, (error) => {
  // outside of (200-299)
  error.response.data.success = false;
  const errorMessage = error.response.data.message
  if (!errorMessage) error.response.data.message = error.message;
  return error.response.data;
});

/**
 * What we append onto the response object.
 */
type AxiosRes = {
  success: true,
} | {
  success: false,
  message: string; 
}

/**
 * /auth
 */
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
 * /users
 */
type IUsersRes = UsersRes & AxiosRes;
type IUserRes = UserRes & AxiosRes;

export const handleUsernameSearch = async (searchText: string): Promise<IUsersRes> => {
  const args: GetUsersReqBody = { username: searchText }
  return await api.post(`/users`, args);
}

export const getUser = async (id: string): Promise<UserRes> => {
  const params: GetUserReqParams = { id }
  return await api.get(`/users/${params.id}`);
}

export const updateDisplayName = async (displayName: string): Promise<IUserRes> => {
  const params: UpdateUserReqParams = { id: (await get('user')).user.id };
  const args: UpdateUserReqBody = { displayName }
  return await api.post(`/users/${params.id}/update`, args);
}

export const updateUsername = async (username: string): Promise<IUserRes> => {
  const params: UpdateUserReqParams = { id: (await get('user')).user.id };
  const args: UpdateUserReqBody = { username }
  return await api.post(`/users/${params.id}/update`, args);
}

export const updateColor = async (color: string): Promise<IUserRes> => {
  const params: UpdateUserReqParams = { id: (await get('user')).user.id };
  const args: UpdateUserReqBody = { color }
  return await api.post(`/users/${params.id}/update`, args);
}

export const updateEmail = async (email: string): Promise<IUserRes> => {
  const params: UpdateUserReqParams = { id: (await get('user')).user.id };
  const args: UpdateUserReqBody = { email }
  return await api.post(`/users/${params.id}/update`, args);
}

export const updatePhoneNumber = async (phoneNumber: number): Promise<IUserRes> => {
  const params: UpdateUserReqParams = { id: (await get('user')).user.id };
  const args: UpdateUserReqBody = { phoneNumber }
  return await api.post(`/users/${params.id}/update`, args);
}

/**
 * /posts
 */
export const getPosts = async (userId: string, url: string): Promise<PostsRes> => {
  const args: GetPostsReqBody = { userId, url }
  return await api.post('/posts/', args);
}

export const getPost = async (postId: string): Promise<PostRes> => {
  const params: GetPostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}`);
}

export const createPost = async (args: CreatePostReqBody): Promise<PostRes> => {
  return await api.post('/posts/create', args);
}

/**
 * /notifications
 */
export const getNotifications = async (): Promise<NotificationsRes> => {
  const args: GetNotificationsReqBody = { userId: (await get('user')).user.id };
  return await api.post('/notifications/', args);
}

export const getNotification = async (notificationId: string): Promise<NotificationRes> => {
  const params: GetNotificationReqParams = { id: notificationId };
  return await api.get(`/posts/${params.id}`);
}
