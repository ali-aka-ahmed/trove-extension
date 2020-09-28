import axios from 'axios';
import { get } from '../utils/chrome/storage';

// "http://localhost:5000/*" -> add to manifest.json for testing locally

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
 * /auth
 */
export const signup = async (args: any): Promise<any> => {
  return await api.post(`/auth/signup`, args);
};

export const login = async (args: any): Promise<any> => {
  return await api.post(`/auth/login`, args);
}

export const forgotPassword = async (args: any): Promise<any> => {
  return await api.post(`/auth/forgot`, args)
}

export const checkValidUsername = async (username: any): Promise<any> => {
  return await api.post(`/auth/username`, { username });
}

/**
 * /users
 */
export const handleUsernameSearch = async (searchText: string) => {
  return await api.post(`/users`, { searchText });
}

export const getUser = async (id: string): Promise<any> => {
  return await api.get(`/users/${id}`);
}

export const updateDisplayName = async (displayName: string): Promise<any> => {
  const id = (await get('user')).user.id;
  return await api.post(`/users/${id}/update`, { displayName });
}

export const updateUsername = async (username: string): Promise<any> => {
  const id = (await get('user')).user.id;
  return await api.post(`/users/${id}/update`, { username });
}

export const updateColor = async (color: string): Promise<any> => {
  const id = (await get('user')).user.id;
  return await api.post(`/users/${id}/update`, { color });
}

export const updateEmail = async (email: string): Promise<any> => {
  const id = (await get('user')).user.id;
  return await api.post(`/users/${id}/update`, { email });
}

export const updatePhoneNumber = async (phoneNumber: number): Promise<any> => {
  const id = (await get('user')).user.id;
  return await api.post(`/users/${id}/update`, { phoneNumber });
}
