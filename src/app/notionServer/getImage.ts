import notionImageApi from '.';
import { getCookie } from '../../utils/chrome/cookies';

const getImage = async ({ url, width, id, table }: GetImageReqBody): Promise<void> => {
  const userId = await getCookie('https://www.notion.so', 'notion_user_id');
  const config = {
    params: {
      ...(width ? { width } : {}),
      userId,
      cache: 'v2',
      ...(id ? { id } : {}),
      ...(table ? { table } : {}),
    },
  };
  return await notionImageApi.post(`/${encodeURIComponent(url)}`, null, config);
};

export default getImage;

export interface GetImageReqBody {
  url: string;
  width?: string;
  id?: string;
  table?: 'collection' | 'block';
}
