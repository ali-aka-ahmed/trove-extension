import { TaggedUser } from './Post';
import { User } from './User';

export interface Notification {
  id: string;
  action: string;
  creationDatetime: number;
  postId: string;
  receiverId: string;
  sender: User;
  url: string;
  content?: string;
  taggedUsers?: TaggedUser[];
}
