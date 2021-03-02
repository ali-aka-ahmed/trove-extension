import IHighlight from './IHighlight';
import ITopic from './ITopic';
import IUser from './IUser';

export default interface IPost {
  id: string;
  content: string;
  creationDatetime: number;
  creator: IUser;
  domain: string;
  url: string;
  topics: ITopic[];
  taggedUsers: IUser[]; // must contain values for parent post
  numComments: number;
  numLikes: number;
  liked: boolean;
  comments?: IPost[];
  parentPostId?: string; // only exists if comment
  highlight: IHighlight;
  references?: IPost[]; // posts in which other people referenced this post
}
