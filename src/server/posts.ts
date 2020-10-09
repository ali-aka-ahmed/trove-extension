import api, { AxiosRes, BaseParams, BaseRes } from '.';
import IPost from '../entities/Post';

type IPostsRes = PostsRes & AxiosRes;
type IPostRes = PostRes & AxiosRes;

export const getPosts = async (url: string): Promise<IPostsRes> => {
  const args: GetPostsReqBody = { url }
  return await api.post('/posts/', args);
}

export const getPost = async (postId: string): Promise<IPostRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}`);
}

export const createPost = async (args: CreatePostReqBody): Promise<IPostRes> => {
  return await api.post('/posts/create', args);
}

export const createComment = async (parentPostId: string, args: CreateCommentReqBody): Promise<IPostRes> => {
  const params: PostReqParams = { id: parentPostId };
  return await api.post(`/posts/${params.id}/comment/create`, args);
}

export const deletePostAndChildren = async (postId: string): Promise<AxiosRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}/comment/delete`);
}

export const editPost = async (postId: string, args: EditPostReqBody): Promise<AxiosRes> => {
  const params: PostReqParams = { id: postId };
  return await api.post(`/posts/${params.id}/update`, args);
}

export const likePost = async (postId: string): Promise<AxiosRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}/like/create`);
}

export const unlikePost = async (postId: string): Promise<AxiosRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}/like/delete`);
}

/** ************************* */
/** ********** REQ ********** */
/** ************************* */

/**
 * POST /posts/
 */
interface GetPostsReqBody {
  url: string;
}

/**
 * POST /posts/create
 */
interface CreatePostReqBody {
  content: string;
  url: string;
  taggedUserIds?: string[];
  highlightConstructor: HighlightConstructor;
}

/**
 * POST /posts/:id/comment/create
 */
interface CreateCommentReqBody {
  content: string;
  url: string;
  taggedUserIds?: string[]; // if you tag someone, they can see this post and everything in the thread
  highlightConstructor?: HighlightConstructor;
}

/**
 * POST /posts/:id/update
 */
interface EditPostReqBody {
  newContent?: string;
  newTaggedUserIds?: string[];
  highlightConstructor?: HighlightConstructor;
}

interface HighlightConstructor {
  context: string; // Highlighted text + surrounding words for context
  text: string;
  range: string; // Serialized Range object
}

/**
 * GET /posts/:id
 * GET /posts/:id/delete
 * POST /posts/:id/comment/create
 * POST /posts/:id/like/create
 * GET /posts/:id/like/delete
 */
interface PostReqParams extends BaseParams {
  id: string;
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /posts/
 */
type PostsRes = {
  posts?: IPost[]; // does not include comments for each post
} & BaseRes;

/**
 * GET /posts/:id
 * POST /posts/create
 * POST /posts/:id/comment/create
 */
type PostRes = {
  thread?: IPost[]; // first index is parent ([parent, child, child of child, ...])
  post?: IPost; // includes comments
} & BaseRes;
