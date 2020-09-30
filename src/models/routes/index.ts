import { Anchor, TaggedUser } from '../nodes/Post';
import { User } from '../nodes/User';

/**
 * Base response object.
 * If status is NOT successful (200 - 299), then message appears.
 */
export type BaseRes = {
  message?: string;
}

/**
 * Base response object. Copy of core.ParamsDictionary in express.
 */
export interface BaseParams {
  [key: string]: string | User | TaggedUser[] | Anchor;
}
