import { api, AxiosRes, BaseRes, notionImageApi } from '.';
import { getCookie } from '../../utils/chrome/cookies';

export type IGetPageNamesRes = GetPageNamesRes & AxiosRes;
export type ISearchPagesRes = SearchPagesRes & AxiosRes;

export const getNotionPages = async (
  spaceId?: string,
  recentIds?: string[],
): Promise<IGetPageNamesRes> => {
  const notionToken = await getCookie('https://www.notion.so', 'token_v2');
  const config = { headers: { 'notion-token': notionToken } };
  const args: GetPageNamesReqBody = {
    ...(spaceId ? { spaceId } : {}),
    ...(recentIds ? { recentIds } : {}),
  };
  return await api.post('/notion/getPages', args, config);
};

export const searchNotionPages = async (
  query: string,
  spaceId: string,
  limit?: number,
): Promise<ISearchPagesRes> => {
  const notionToken = await getCookie('https://www.notion.so', 'token_v2');
  const config = { headers: { 'notion-token': notionToken } };
  const args: SearchPagesReqBody = { query, spaceId, limit };
  return await api.post('/notion/search', args, config);
};

export const getNotionImage = async (
  url: string,
  id: string,
  width?: number,
): Promise<ISearchPagesRes> => {
  const config = {
    params: {
      ...(width ? { width } : {}),
      url,
      id,
    },
  };
  return await notionImageApi.post(`/${url}`, {}, config);
};

export const addNotionTextBlock = async (
  pageId: string,
  text: string | any[],
): Promise<AxiosRes> => {
  const [userId, notionToken] = await Promise.all([
    getCookie('https://www.notion.so', 'notion_user_id'),
    getCookie('https://www.notion.so', 'token_v2'),
  ]);
  const config = { headers: { 'notion-token': notionToken } };
  return await api.post('/notion/writeText', { userId, pageId, text }, config);
};

export type Icon = {
  value: string;
  type: 'url' | 'emoji';
};

export type Record = {
  id: string;
  name: string;
  type: 'database' | 'page' | 'space';
  icon?: Icon;
  section?: 'database' | 'page' | 'recent';
  path?: string;
}

/**
 * POST /notion/writeText
 */
export interface WriteTextReqBody {
  userId: string;
  pageId: string;
  text: string;
}

/**
 * POST /notion/getPages
 */
export interface GetPageNamesReqBody {
  spaceId?: string;
  recentIds?: string[];
}

/**
 * POST /notion/search
 */
export interface SearchPagesReqBody {
  limit?: number;
  query: string;
  spaceId: string;
}

/**
 * POST /notion/getImage
 */
export interface GetImageReqBody {
  url: string;
  id: string;
  width?: number;
}

/**
 * POST /notion/getPages
 */
type GetPageNamesRes = {
  spaces?: Array<Record>;
  results?: {
    [spaceId: string]: {
      recents?: Record[];
      pages?: Record[];
      databases?: Record[];
    };
  };
  defaults?: {
    [spaceId: string]: Record;
  };
} & BaseRes;

/**
 * POST /notion/search
 */
type SearchPagesRes = {
  spaceId?: string;
  pages?: Record[];
  databases?: Record[];
} & BaseRes;
