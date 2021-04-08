import notionApi, { NotionErrorRes, NotionSuccessRes } from '.';
import { getCookie } from '../../utils/chrome/cookies';

const getSpaces = async (): Promise<GetSpacesRes> => {
  const notionToken = await getCookie('https://www.notion.so', 'token_v2');
  const config = { headers: { cookie: `token_v2=${notionToken}` } };
  const res: IGetSpaces = await notionApi.post('/getSpaces', {}, config);
  if (res.success === false) return res;
  const notionUserIds = Object.keys(res).filter((key) => key !== 'success');
  return { success: true, notionUserIds };
};

export default getSpaces;

/**
 * Final interface
 */
export type GetSpacesRes =
  | ({
      notionUserIds: string[];
    } & NotionSuccessRes)
  | NotionErrorRes;

/**
 * Helper interfaces
 */
type IGetSpaces =
  | ({
      [userId: string]: object;
    } & NotionSuccessRes)
  | NotionErrorRes;
