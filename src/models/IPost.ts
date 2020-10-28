import IHighlight from './IHighlight';
import IUser from './IUser';

export interface ITag {
  text: string;
  color: string; // hex code
}

export default interface IPost {
  id: string;
  content: string;
  creationDatetime: number;
  creator: IUser;
  domain: string;
  url: string;
  tags: ITag[];
  taggedUsers: IUser[]; // must contain values for parent post
  numComments: number;
  numLikes: number;
  comments?: IPost[];
  parentPostId?: string; // only exists if comment
  highlight?: IHighlight;
  references?: IPost[]; // posts in which other people referenced this post
}
