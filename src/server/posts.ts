import { api, AxiosRes, BaseParams, BaseRes } from '.';
import { XRange } from '../components/SidebarWrapper/helpers/highlight/rangeUtils';
import Post from '../entities/Post';
import ITopic from '../models/ITopic';

export type IPostsRes = PostsRes & AxiosRes;
export type IPostRes = PostRes & AxiosRes;

export const getPosts = async (url: string): Promise<IPostsRes> => {
  const args: GetPostsReqBody = { url }
  return await api.post('/posts/', args);
}

export const getPost = async (postId: string): Promise<IPostRes> => {
  const params: BaseParams = { id: postId };
  return await api.get(`/posts/${params.id}`);
}

export const createPost = async (args: CreatePostReqBody): Promise<IPostRes> => {
  return await api.post('/posts/create', args);
}

export const createReply = async (parentPostId: string, args: CreateCommentReqBody): Promise<IPostRes> => {
  const params: BaseParams = { id: parentPostId };
  return await api.post(`/posts/${params.id}/comment/create`, args);
}

export const deletePostAndChildren = async (postId: string): Promise<AxiosRes> => {
  const params: BaseParams = { id: postId };
  return await api.get(`/posts/${params.id}/delete`);
}

export const editPost = async (postId: string, args: EditPostReqBody): Promise<AxiosRes> => {
  const params: BaseParams = { id: postId };
  return await api.post(`/posts/${params.id}/update`, args);
}

export const likePost = async (postId: string): Promise<AxiosRes> => {
  const params: BaseParams = { id: postId };
  return await api.get(`/posts/${params.id}/like/create`);
}

export const unlikePost = async (postId: string): Promise<AxiosRes> => {
  const params: BaseParams = { id: postId };
  return await api.get(`/posts/${params.id}/like/delete`);
}

/**
 * POST /posts/
 */
export interface GetPostsReqBody {
  paginationStart?: number;
  url?: string;
}

/**
 * POST /posts/create
 */
export interface CreatePostReqBody {
  content: string;
  url: string;
  taggedUserIds?: string[];
  highlight?: HighlightParam;
  topics?: ITopic[];
}

type HighlightParam = {
  context: string; // Highlighted text + surrounding words for context
  text: string;
  range: XRange; // Serialized Range object
  url: string;
};

/**
 * POST /posts/:id/comment/create
 */
export interface CreateCommentReqBody {
  content: string;
  url: string;
  taggedUserIds?: string[]; // if you tag someone, they can see this post and tag others
  highlight?: HighlightParam;
  topics?: ITopic[];
}

/**
 * POST /posts/:id/update
 */
interface EditPostReqBody {
  content?: string;
  taggedUserIds?: string[];
  topics?: ITopic[];
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /posts/
 */
type PostsRes = {
  posts?: Post[]; // does not include comments for each post
} & BaseRes;

/**
 * GET /posts/:id
 * POST /posts/create
 * POST /posts/:id/comment/create
 */
type PostRes = {
  thread?: Post[]; // first index is parent ([parent, child, child of child, ...])
  post?: Post; // includes comments
} & BaseRes;
