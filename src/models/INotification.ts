import IUser from './IUser';

export enum NotificationType {
  Tag = 'Tag',
  Like = 'Like',
  Comment = 'Comment',
  Follow = 'Follow',
}

export default interface INotification {
  id: string;
  type: NotificationType;
  action: string;
  creationDatetime: number;
  read: boolean;
  sender: IUser;
  content?: string;
  postId?: string;
  taggedUsers?: IUser[];
  url?: string;
}
