import axios from 'axios';
import { BACKEND_URL } from '../../config';
import { getCookie } from '../../utils/chrome/cookies';
import { get1 } from '../../utils/chrome/storage';

export const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await get1('token');
  token ? (config.headers.Authorization = `bearer ${token}`) : null;
  return config;
});

api.interceptors.response.use(
  (response) => {
    response.data.success = true;
    return response.data;
  },
  (error) => {
    if (!error.response) return error;
    error.response.data.success = false;
    error.response.data.message = error.response.data.message || error.message;
    return error.response.data;
  },
);

export const notionImageApi = axios.create({
  baseURL: 'https://www.notion.so/image',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

notionImageApi.interceptors.request.use(async (config) => {
  const notionToken = await getCookie('https://www.notion.so', 'token_v2');
  notionToken ? (config.headers.cookies = `token_v2=${notionToken}`) : null;
  return config;
});

notionImageApi.interceptors.response.use(
  (response) => {
    console.info("response.data", response.data, )
    response.data.success = true;
    return response.data;
  },
  (error) => {
    console.error("error.response.data", error.response.data)
    if (!error.response) return error;
    error.response.data.success = false;
    error.response.data.message = error.response.data.message || error.message;
    return error.response.data;
  },
);

/**
 * What we append onto the response object.
 */
export type AxiosRes =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

/**
 * Base response object.
 * If status is NOT successful (200 - 299), then message appears.
 */
export type BaseRes = {
  message?: string;
};

/**
 * Base params object. Copy of core.ParamsDictionary in express.
 */
export interface BaseParams {
  id: string;
  [key: string]: string;
}
