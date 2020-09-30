import { v4 as uuid } from 'uuid';
import Post from '../../../models/nodes/Post';
import URL from '../../../models/nodes/URL';
import User from '../../../models/nodes/User';
import { displayRelativeTime } from '../../../utils';

export default class Notification {
  public id: string;
  public content: string;
  public sender: User;
  public url: string;
  public postId: string;
  public taggedUsers: User[];
  private creationDatetime: number;
  
  public constructor(p: Post, u: URL, sender: User, taggedUsers: User[]) {
    this.id = uuid();
    this.content = p.content;
    this.creationDatetime = p.creationDatetime;
    this.sender = sender;
    this.url = u.url;
    this.postId = p.id;
    this.taggedUsers = taggedUsers;
  }

  get time() {
    return displayRelativeTime(this.creationDatetime)
  };
};
