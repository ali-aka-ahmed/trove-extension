import IUser from './IUser';

export default interface INotification {
  id: string;
  action: string;
  content: string;
  sender: IUser;
  url: string;
  postId: string;
  read: boolean;
  taggedUsers: IUser[];
  creationDatetime: number;
}
