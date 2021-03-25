import axios, { AxiosRequestConfig } from 'axios';
import { BACKEND_URL } from '../../config';
import { get1 } from '../../utils/chrome/storage';

/**
 * OUR SERVER API INSTANCE
 */
export const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: RequestConfig) => {
  const token = await get1('token');
  token ? (config.headers.Authorization = `bearer ${token}`) : null;
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  // (200-299)
  (res) => {
    const startTime = (res.config as RequestConfig).metadata.startTime
    const endTime = Date.now();
    const time = endTime - startTime;
    return { success: true, time, status: res.status, ...res.data };
  },
  // outside of (200-299)
  (err) => {
    const startTime = (err.config as RequestConfig).metadata.startTime
    const endTime = Date.now();
    const time = endTime - startTime;
    return {
      success: false,
      time,
      status: (err.response ? err.response.status : 500),
      message: (err.response ? err.response.data.message : err.message)
    };
  },
);

type RequestConfig = {
  metadata: {
    startTime: number;
  }
} & AxiosRequestConfig;

/**
 * What we append onto the response object.
 */
export type AxiosRes =
  | {
      success: true;
      status: number;
      time: number;
    }
  | {
      success: false;
      status: number;
      time: number;
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
