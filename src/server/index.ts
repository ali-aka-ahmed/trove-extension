import axios from 'axios';
import { User } from '../models';
import { localGet } from '../utils/chromeStorage';

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
  let user = (await localGet('user')).user;
  user.displayName = displayName;
  return { user };
}

export const updateUsername = async (username: string): Promise<{ 
  error?: Error, 
  user: User | null,
}> => {
  let user = (await localGet('user')).user;
  user.username = username;
  return { user };
}

export const updateColor = async (color: string): Promise<{ 
  error?: Error, 
  user: User | null,
}> => {
  let user = (await localGet('user')).user;
  user.color = color;
  return { user };
}

/**
 * AUTHENTICATION
 */

export const signup = async () => {};

export const login = async () => {};

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