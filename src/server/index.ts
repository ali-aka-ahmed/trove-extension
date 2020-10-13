import axios from 'axios';
import { get1 } from '../utils/chrome/storage';

/**
 * What we append onto the response object.
 */
export type AxiosRes = {
  success: true,
} | {
  success: false,
  message: string; 
};

/**
 * Base response object.
 * If status is NOT successful (200 - 299), then message appears.
 */
export type BaseRes = {
  message?: string;
}

/**
 * Base params object. Copy of core.ParamsDictionary in express.
 */
export interface BaseParams {
  [key: string]: string;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 2000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await get1('token');
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

export default api;
