import axios from 'axios';
import { User } from '../models/nodes/User';
import { get } from '../utils/chrome/storage';

const api_inst = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    timeout: 2000,
    headers: {'Content-Type': 'application/json'}
});

/**
 * PROFILE
 */

export const updateDisplayName = async (displayName: string): Promise<{ 
  error?: Error, 
  user: User | null,
}> => {
  let user = (await get('user')).user;
  user.displayName = displayName;
  return { user };
}

export const updateUsername = async (username: string): Promise<{ 
  error?: Error, 
  user: User | null,
}> => {
  let user = (await get('user')).user;
  user.username = username;
  return { user };
}

// { 
//   success: boolean, 
//   error: Error
// }

export const updateColor = async (color: string): Promise<{ 
  error?: Error, 
  user: User | null,
}> => {
  let user = (await get('user')).user;
  user.color = color;
  return { user };
}

/**
 * AUTHENTICATION
 */

export const signup = async () => {};
// displayName
// phoneNumber

// username set random
// totp auth for phonenumber

export const login = async () => {};
// phone or email or username (ill do some research)
// phone no could be username so have to do login request on both...
// password

export const logout = async () => {
  const responseData = await api_inst.get('/logout');
  return responseData.data;
}

export const checkValidUsername = async (username: string) => {
  const responseData = await api_inst.post('/check-valid-username', {username});
  return responseData.data;
}

export const forgotPassword = async (email: string) => {
  const responseData = await api_inst.post('/forgot-password', {email});
  return responseData.data;
}

export const resetPassword = async (password: string, token: string) => {
  const responseData = await api_inst.post(`/reset/${token}`, {password});
  return responseData.data;
}