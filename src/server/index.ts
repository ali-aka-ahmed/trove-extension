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

// FOR DEV
// 1. "http://localhost:5000/*" -> add to manifest.json for testing locally
// 2. Replace the token in the request interceptor with a token retrieved from Postman
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
  console.log('response', response)
  response.data.success = true;
  return response.data;
}, (error) => {
  // outside of (200-299)
  console.log('error', error)
  console.log('config', error.config)
  console.log('code', error.code);
  console.log('request', error.request);
  console.log('response', error.response);
  console.log(error.isAxiosError, error.isJSON)
  
  error.response.data.success = false;
  const errorMessage = error.response.data.message
  if (!errorMessage) error.response.data.message = error.message;
  return error.response.data;
});

export default api;
