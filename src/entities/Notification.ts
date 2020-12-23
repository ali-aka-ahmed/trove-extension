import INotification, { NotificationType } from '../models/INotification';
import { displayRelativeTime } from '../utils';
import User from './User';

export default class Notification implements INotification {
  public id: string;
  public type: NotificationType;
  public action: string;
  public creationDatetime: number;
  public read: boolean;
  public sender: User;
  public content?: string;
  public postId?: string;
  public taggedUsers?: User[];
  public url?: string;

  public constructor(n: INotification) {
    this.id = n.id;
    this.type = n.type;
    this.action = n.action;
    this.creationDatetime = n.creationDatetime;
    this.sender = new User(n.sender);
    this.read = n.read;
    if (n.content) this.content = n.content;
    if (n.url) this.url = n.url;
    if (n.postId) this.postId = n.postId;
    if (n.taggedUsers) this.taggedUsers = n.taggedUsers.map((u) => new User(u));
  }

  get domain() {
    if (this.url) return new URL(this.url).hostname;
  }

  get path() {
    if (this.url) return new URL(this.url).pathname;
  }

  get time() {
    return displayRelativeTime(this.creationDatetime)
  };
};
