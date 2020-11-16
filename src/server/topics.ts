import { api, AxiosRes, BaseParams, BaseRes } from '.';
import ITopic from '../models/ITopic';

export type ITopicsRes = TopicsRes & AxiosRes;
export type ITopicRes = TopicRes & AxiosRes;

export const getTopics = async (text?: string): Promise<ITopicsRes> => {
  const args: GetTopicsReqBody = text ? { text } : {}
  return await api.post('/topics/', args);
};

export const handleTopicSearch = async (text: string): Promise<ITopicsRes> => {
  const args: GetTopicsReqBody = { text }
  return await api.post('/topics/', args);
}

export const createTopic = async (text: string, color: string): Promise<ITopicRes> => {
  const args: CreateTopicReqBody = { text, color }
  return await api.post('/topics/create', args);
}

export const updateTopic = async (topicId: string, args: UpdateTopicReqBody): Promise<ITopicRes> => {
  const params: BaseParams = { id: topicId };
  return await api.post(`/topics/${params.id}/update`, args);
}

export const linkTopicToPosts = async (topicId: string, postIds: string[]): Promise<ITopicRes> => {
  const params: BaseParams = { id: topicId };
  const args: LinkPostsReqBody = { postIds };
  return await api.post(`/topics/${params.id}/link`, args);
}

export const deleteTopics = async (topicId: string): Promise<ITopicRes> => {
  const params: BaseParams = { id: topicId };
  return await api.get(`/topics/${params.id}/delete`);
}

/**
 * POST /topics/
 */
interface GetTopicsReqBody {
  text?: string;
}

/**
 * POST /topics/create
 */
interface CreateTopicReqBody {
  text: string;
  color: string;
}

/**
 * POST /topics/:id/update
 */
interface UpdateTopicReqBody {
  text?: string;
  color?: string;
}

/**
 * POST /topics/:id/link
 */
interface LinkPostsReqBody {
  postIds?: string[];
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /topics/create
 * POST /topics/:id/update
 * POST /topics/:id/link
 * GET /topics/:id/delete
 */
type TopicRes = {
  topic?: ITopic;
} & BaseRes;

/**
 * POST /topics/
 */
type TopicsRes = {
  topics?: ITopic[];
} & BaseRes;
