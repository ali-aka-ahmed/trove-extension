import axios from 'axios';
import { NOTION_API_URL, NOTION_REQUEST_TIMEOUT } from '../../constants/index';
import { getCookie } from '../../utils/chrome/cookies';

/**
 * NOTION API INSTANCE
 */
export const notionApi = axios.create({
  baseURL: NOTION_API_URL,
  timeout: NOTION_REQUEST_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
});

notionApi.interceptors.response.use(
  // (200-299)
  (response) => ({ success: true, ...response.data }),
  // outside of (200-299)
  (error) => ({ success: false, error }),
);

notionApi.interceptors.request.use(async (config) => {
  const notionToken = await getCookie('https://www.notion.so', 'token_v2');
  notionToken ? (config.headers.cookie = `token_v2=${notionToken}`) : null;
  return config;
});

/**
 * IMAGE API INSTANCE
 */
export const notionImageApi = axios.create({
  baseURL: 'https://www.notion.so/image',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

notionImageApi.interceptors.request.use(async (config) => {
  const notionToken = await getCookie('https://www.notion.so', 'token_v2');
  notionToken ? (config.headers.cookie = `token_v2=${notionToken}`) : null;
  return config;
});

notionImageApi.interceptors.response.use(
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

export type NotionSuccessRes = {
  success: true;
};

export type NotionErrorRes = {
  success: false;
  error: NotionError;
};

export type NotionError = {
  config: object;
  request: object;
  response: {
    status: number;
    statusText: string;
    headers: object;
    config: object;
    request: object;
    data: object;
  };
  isAxiosError: boolean;
  toJSON: Function;
  code?: string;
} & Error;

export type PageRecord = {
  type: 'page';
  id: string;
  name: string;
  iconEmoji?: string;
  iconUrl?: string;
  role: 'editor';
  table: 'block';
}

export type CollectionRecord = {
  type: 'collection_view';
  collectionId: string;
  id: string;
  name: string;
  iconEmoji?: string;
  iconUrl?: string;
  role: 'editor';
  table: 'block';
  urlProperties: Array<{ id: string; name: 'URL' }>;
}

export type SpaceRecord = {
  type: 'space';
  id: string;
  name: string;
  iconUrl?: string;
  role: 'editor';
  table: 'space';
}

export default notionApi;
