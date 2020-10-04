import { User } from './User';

export interface Notification {
  id: string;
  action: string;
  content: string;
  sender: User;
  url: string;
  postId: string;
  taggedUsers: User[];
  creationDatetime: number;
}
