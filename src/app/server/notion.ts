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

export const addTextBlock = async (
  userId: string,
  pageId: string,
  text: string | any[],
): Promise<void> => {
  const notionToken = await getCookie('https://www.notion.so', 'token_v2');
  const config = { headers: { 'notion-token': notionToken } };
  return await api.post('/notion/search', { userId, pageId, text }, config);
};

export type Icon = {
  value: string;
  type: 'url' | 'emoji';
};

export type Record = {
  id: string;
  name: string;
  type: 'database' | 'page';
  section?: 'database' | 'page' | 'recent';
  path?: string;
  icon?: Icon;
};

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
 * GET /getPageNames
 */
type GetPageNamesRes = {
  spaceId?: string;
  recents?: Record[];
  pages?: Record[];
  databases?: Record[];
} & BaseRes;

/**
 * POST /notion/search
 */
type SearchPagesRes = {
  spaceId?: string;
  pages?: Record[];
  databases?: Record[];
} & BaseRes;
