import CommentType from '../enums/CommentType';

interface Like {
  id: string;
  name?: string;
  userId?: string;
  username?: string;
};

export default interface Comment {
  id: number;
  parentId?: string; // CommentType.Post, this does not exist
  comments?: Comment[]; // CommentType.Replies, this does not exist
  content?: string;
  likes?: Like[];
  name?: string;
  type?: CommentType
  userId?: string;
  username?: string;
};
