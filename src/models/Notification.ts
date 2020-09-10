import { User } from '.';

export default interface Notification {
  id: string;
  postId: string;
  receiverId: string;
  senders: User[]; // id, displayName, username, color (no normalizedUsername, creationDatetime)
  action: string;
  creationDatetime: number;
  url: string;
};
