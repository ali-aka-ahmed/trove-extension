import INotification from '../models/INotification';
import { displayRelativeTime } from '../utils';
import User from './User';

export default class Notification implements INotification {
  public id: string;
  public action: string;
  public content: string;
  public sender: User;
  public url: string;
  public postId: string;
  public taggedUsers: User[];
  public creationDatetime: number;

  public constructor(n: INotification) {
    this.id = n.id;
    this.action = n.action;
    this.content = n.content;
    this.creationDatetime = n.creationDatetime;
    this.sender = new User(n.sender);
    this.url = n.url;
    this.postId = n.postId;
    this.taggedUsers = n.taggedUsers.map((u) => new User(u));
  }

  get time() {
    return displayRelativeTime(this.creationDatetime)
  };
};
