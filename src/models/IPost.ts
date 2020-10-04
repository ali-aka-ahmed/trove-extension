import IHighlight from './IHighlight';
import IUser from './IUser';

export default interface IPost {
  id: string;
  content: string;
  creationDatetime: number;
  creator: IUser;
  domain: string;
  url: string;
  taggedUsers: IUser[];
  numComments: number;
  numLikes: number;
  highlight?: IHighlight;
  comments?: IPost[];
  references?: IPost[]; // posts in which other people referenced this post
}
