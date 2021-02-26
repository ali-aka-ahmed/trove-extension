import { api, AxiosRes, BaseRes } from '.';
import { getCookie } from '../../utils/chrome/cookies';

export type IGetPageNamesRes = GetPageNamesRes & AxiosRes;
export type ISearchPagesRes = SearchPagesRes & AxiosRes;

export const getNotionPages = async (
  spaceId?: string,
  recentIds?: string[],
): Promise<IGetPageNamesRes> => {
  const args: GetPageNamesReqBody = {
    ...(spaceId ? { spaceId } : {}),
    ...(recentIds ? { recentIds } : {}),
  };
  return await api.post('/notion/getPages', args);
};

export const searchNotionPages = async (
  query: string,
  spaceId: string,
  limit?: number,
): Promise<ISearchPagesRes> => {
  const args: SearchPagesReqBody = { query, spaceId, limit };
  return await api.post('/notion/search', args);
};

export const getNotionAuthToken = () => {
  return getCookie('https://www.notion.so', 'token_v2');
};

export type Icon = {
  value: string;
  type: 'url' | 'emoji';
};

export type Record = {
  id: string;
  name: string;
  type: 'database' | 'page';
  section?: 'recent' | 'database' | 'page';
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
