import { api, AxiosRes, BaseParams, BaseRes } from '.';
import { XRange } from '../components/SidebarWrapper/helpers/highlight/rangeUtils';
import IPost, { ITopic } from '../models/IPost';

export type IPostsRes = PostsRes & AxiosRes;
export type IPostRes = PostRes & AxiosRes;
export type ITagsRes = TagsRes & AxiosRes;

export const getPosts = async (url: string): Promise<IPostsRes> => {
  const args: GetPostsReqBody = { url }
  return await api.post('/posts/', args);
}

export const getPost = async (postId: string): Promise<IPostRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}`);
}

export const handleTagSearch = async (tag?: string): Promise<ITagsRes> => {
  const args: GetTagsReqBody = { ...(tag && { tag })}
  return await api.post('/posts/tags', args);
}

export const createPost = async (args: CreatePostReqBody): Promise<IPostRes> => {
  return await api.post('/posts/create', args);
}

export const createReply = async (parentPostId: string, args: CreateReplyReqBody): Promise<IPostRes> => {
  const params: PostReqParams = { id: parentPostId };
  return await api.post(`/posts/${params.id}/comment/create`, args);
}

export const deletePostAndChildren = async (postId: string): Promise<AxiosRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}/comment/delete`);
}

// export const editPost = async (postId: string, args: EditPostReqBody): Promise<AxiosRes> => {
//   const params: PostReqParams = { id: postId };
//   return await api.post(`/posts/${params.id}/update`, args);
// }

export const likePost = async (postId: string): Promise<AxiosRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}/like/create`);
}

export const unlikePost = async (postId: string): Promise<AxiosRes> => {
  const params: PostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}/like/delete`);
}

export type HighlightParam = {
  context: string; // Highlighted text + surrounding words for context
  text: string;
  range: XRange; // Serialized Range object
  url: string;
};

/**
 * POST /posts/
 */
export interface GetPostsReqBody {
  url: string;
}

/**
 * POST /posts/tags
 */
interface GetTagsReqBody {
  tag?: string;
}

/**
 * POST /posts/create
 */
export interface CreatePostReqBody {
  content: string;
  url: string;
  taggedUserIds?: string[];
  highlight?: HighlightParam;
  tags?: ITopic[];
}

/**
 * POST /posts/:id/comment/create
 */
export interface CreateReplyReqBody {
  content: string;
  url: string;
  highlight?: HighlightParam;
  taggedUserIds?: string[]; // if you tag someone, they can see this post and everything in the thread
  tags?: ITopic[];
}

/**
 * POST /posts/:id/update
 */
// export interface EditPostReqBody {
//   newContent?: string;
//   newTaggedUserIds?: string[];
//   highlight?: HighlightParam;
//   tags?: ITag[];
// }

/**
 * GET /posts/:id
 * GET /posts/:id/delete
 * POST /posts/:id/comment/create
 * POST /posts/:id/like/create
 * GET /posts/:id/like/delete
 */
export interface PostReqParams extends BaseParams {
  id: string;
}

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

/**
 * POST /posts/tags
 */
type TagsRes = {
  tags?: string[];
} & BaseRes;
