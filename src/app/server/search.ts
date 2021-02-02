import { api, AxiosRes, BaseRes } from '.';
import ITopic from '../../models/ITopic';

export type ITopicsRes = TopicsRes & AxiosRes;

export const searchTopics = async (args: SearchTopicsReqBody): Promise<ITopicsRes> => {
  return await api.post('/search/topic', args);
};

/**
 * POST /search/topic
 */
interface SearchTopicsReqBody {
  textPrefix?: string;
  numResults?: number; // defaults to 10
}

/**
 * POST /search/topic
 */
type TopicsRes = {
  topics?: ITopic[];
} & BaseRes;