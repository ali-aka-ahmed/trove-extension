import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import IPost from '../models/IPost';
import Highlight from './Highlight';
import User from './User';

export default class Post implements IPost {
  public id: string;
  public content: string;
  public creationDatetime: number;
  public creator: User;
  public domain: string;
  public url: string;
  public taggedUsers: User[]; // must contain values for parent post
  public numComments: number;
  public numLikes: number;
  public comments?: Post[];
  public parentPostId?: string;
  public highlight?: Highlight;
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
    if (p.comments) this.comments = p.comments.map((p) => new Post(p));
    if (p.parentPostId) this.parentPostId = p.parentPostId
    if (p.highlight) this.highlight = new Highlight(p.highlight);
    if (p.references) this.references = p.references.map((p) => new Post(p));
  }

  get timeAgo() {
    TimeAgo.addLocale(en);
    const timeAgo = new TimeAgo('en-US');
    return timeAgo.format(this.creationDatetime, 'twitter');
    // return displayRelativeTime(this.creationDatetime)
  };

  get isTopOfThread() {
    return !this.parentPostId
  };
  
  get isComment() {
    return !!this.parentPostId
  };
};
