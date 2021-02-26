import { apiNotionRoutes, AxiosRes, BaseRes } from '.';

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
  return await apiNotionRoutes.post('/notion/getPages', args);
};

export const searchNotionPages = async (
  query: string,
  spaceId: string,
  limit?: number,
): Promise<ISearchPagesRes> => {
  const args: SearchPagesReqBody = { query, spaceId, limit };
  return await apiNotionRoutes.post('/notion/search', args);
};

export type Icon = {
  value: string;
  type: 'url' | 'emoji';
};

export type Record = {
  id: string;
  name: string;
  type: 'database' | 'page';
  section?: 'database' | 'page';
  path?: string;
  icon?: Icon;
} | {
  id: string;
  name: string;
  type: 'database' | 'page';
  section: 'recent';
  datetimeExpiry: number;
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
