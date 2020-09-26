import { User } from '.';
import Anchor from "../components/Content/helpers/Anchor";

export interface TaggedUser {
  id: string;
  isTaggedInReply: boolean;
  username: string;
  color: string;
};

export default interface Post {
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
};
