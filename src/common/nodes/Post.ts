import { RangyRangeEx } from '@rangy/core';
import { User } from './User';

/**
 * @enum {number} AnchorType
 */
export enum AnchorType {
  Div,
  Point,
  Text,
}

/**
 * @interface Point
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * @typedef {object} Anchor
 */
export type Anchor = {
  type: AnchorType.Point;
  location: Point;
  bounds: Point;
} | {
  type: AnchorType.Text;
  range: RangyRangeEx;
};

/**
 * @interface TaggedUser
 */
export interface TaggedUser {
  id: string;
  isTaggedInReply: boolean;
  username: string;
  color: string;
}

/**
 * @interface Post
 */
export interface Post {
  id: string;
  content: string;
  creationDatetime: number;
  creator: User; // id, displayName, username, color (no normalizedUsername, creationDatetime)
  creatorUserId: string;
  url: string;
  anchor?: Anchor;
  parentId?: string;
  replies?: Post[];
  taggedUserIds?: string[]; // includes parent user ids (for replies)
  taggedUsers?: TaggedUser[];
}
