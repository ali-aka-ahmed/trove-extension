import notionImageApi from '.';
import { get1 } from '../../utils/chrome/storage';

const getImage = async ({ url, width, id, table }: GetImageReqBody): Promise<void> => {
  const userId = await get1('notionUserId');
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
