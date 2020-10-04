import { Highlight } from './Highlight';
import { User } from './User';

export interface Post {
  id: string;
  content: string;
  creationDatetime: number;
  creator: User;
  domain: string;
  url: string;
  taggedUsers: User[];
  numComments: number;
  numLikes: number;
  highlight?: Highlight;
  comments?: Post[];
  references?: Post[]; // posts in which other people referenced this post
}
