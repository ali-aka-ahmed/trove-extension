import { BaseParams, BaseRes } from '.';
import IHighlight from '../entities/IHighlight';
import IPost from '../entities/IPost';

/**
 * ROUTES for /posts
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

/** ************************* */
/** ********** RES ********** */
/** ************************* */

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
