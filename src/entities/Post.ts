import IPost from '../models/entities/IPost';
import { displayRelativeTime } from '../utils';
import Highlight from './Highlight';
import User from './User';

export default class Post implements IPost {
  public id: string;
  public content: string;
  public creationDatetime: number;
  public creator: User;
  public domain: string;
  public url: string;
  public taggedUsers: User[];
  public numComments: number;
  public numLikes: number;
  public highlight?: Highlight;
  public comments?: Post[];
  public references?: Post[]; // posts in which other people referenced this post

  public constructor(p: IPost) {
    this.id = p.id;
    this.content = p.content;
    this.creationDatetime = p.creationDatetime;
    this.creator = new User(p.creator);
    this.domain = p.domain;
    this.url = p.url;
    this.taggedUsers = p.taggedUsers.map((u) => new User(u));
    this.numComments = p.numComments;
    this.numLikes = p.numLikes;
    if (p.highlight) this.highlight = new Highlight(p.highlight);
    if (p.comments) this.comments = p.comments.map((p) => new Post(p));
    if (p.references) this.references = p.references.map((p) => new Post(p));
  }

  get time() {
    return displayRelativeTime(this.creationDatetime)
  };
};
