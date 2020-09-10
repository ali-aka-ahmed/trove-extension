export interface Creator {
  id: string;
  displayName: string;
  username: string;
  color: string;
};

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
  creator: Creator;
  creatorUserId: string;
  url: string;
  parentId?: string;
  replies?: Post[];
  taggedUserIds?: string[]; // includes parent user ids (for replies)
  taggedUsers?: TaggedUser[];
};
