import api, { BaseParams, BaseRes } from ".";
import IHighlight from "../models/IHighlight";
import IPost from "../models/IPost";

export const getPosts = async (userId: string, url: string): Promise<PostsRes> => {
  const args: GetPostsReqBody = { userId, url }
  return await api.post('/posts/', args);
}

export const getPost = async (postId: string): Promise<PostRes> => {
  const params: GetPostReqParams = { id: postId };
  return await api.get(`/posts/${params.id}`);
}

export const createPost = async (args: CreatePostReqBody): Promise<PostRes> => {
  return await api.post('/posts/create', args);
}

/**
 * POST /
 */
export interface GetPostsReqBody {
  userId: string;
  url: string;
}

/**
 * POST /create
 */
export interface CreatePostReqBody {
  content: string;
  creatorUserId: string;
  taggedUserIds: string[];
  highlight: IHighlight;
  url: string;
}

/**
 * GET /:id
 */
export interface GetPostReqParams extends BaseParams {
  id: string;
}

/**
 * POST /
 */
export type PostsRes = {
  posts?: IPost[];
} & BaseRes;

/**
 * POST /
 * GET /:id
 */
export type PostRes = {
  post?: IPost;
} & BaseRes;
