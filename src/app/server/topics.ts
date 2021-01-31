import { api, AxiosRes, BaseRes } from '.';
import ITopic from '../../models/ITopic';

export type ITopicsRes = TopicsRes & AxiosRes;

export const getTopics = async (args: GetTopicsReqBody): Promise<ITopicsRes> => {
  return await api.post('/topics/', args);
};

/**
 * POST /topics/
 */
interface GetTopicsReqBody {
  textPrefix: string;
  numResults: number;
}

/**
 * POST /topics/
 */
type TopicsRes = {
  topics?: ITopic[];
} & BaseRes;
