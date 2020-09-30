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

export type Anchor = {
  type: AnchorType.Text;
  range: string;
};

export interface TaggedUser {
  id: string;
  isTaggedInReply: boolean;
  username: string;
  color: string;
}

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