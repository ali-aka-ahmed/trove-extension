import { BaseParams, BaseRes } from '.';
import { Anchor, Post, TaggedUser } from '../nodes/Post';
import { User } from '../nodes/User';

/**
 * ROUTES
 *
 * POST /
 * POST /create
 * GET /:id
 */

/** ************************* */
/** ********** REQ ********** */
/** ************************* */

/**
 * POST /
 */
export interface GetPostsReqBody extends BaseParams {
  userId: string;
  url: string;
}

/**
 * POST /create
 */
export interface CreatePostReqBody extends BaseParams {
  content: string;
  creator: User;
  url: string;
  anchor: Anchor;
  taggedUsers: TaggedUser[];
}

/**
 * GET /:id
 */
export interface GetPostReqParams extends BaseParams {
  id: string;
}

/** ************************* */
/** ********** RES ********** */
/** ************************* */

/**
 * POST /
 */
export type PostsRes = {
  posts?: Post[];
} & BaseRes;

/**
 * POST /
 * GET /:id
 */
export type PostRes = {
  post?: Post;
} & BaseRes;
