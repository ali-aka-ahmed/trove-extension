import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import IPost from '../models/IPost';
import ITopic from '../models/ITopic';
import { likePost, unlikePost } from '../server/posts';
import Highlight from './Highlight';
import Topic from './Topic';
import User from './User';

export default class Post implements IPost {
  public content: string;
  public topics: Topic[];
  public taggedUsers: User[]; // must contain values for parent post
  public numComments: number;
  public numLikes: number;
  public highlight?: Highlight;
  public comments?: Post[];
  public liked: boolean;
  public id: string;
  public creationDatetime: number;
  public creator: User;
  public domain: string;
  public url: string;
  public parentPostId?: string;

  public constructor(p: IPost) {
    this.id = p.id;
    this.content = p.content;
    this.creationDatetime = p.creationDatetime;
    this.creator = new User(p.creator);
    this.domain = p.domain;
    this.url = p.url;
    this.topics = p.topics.sort((t1, t2) => t2.creationDatetime - t1.creationDatetime);
    this.taggedUsers = p.taggedUsers.map((u) => new User(u));
    this.numComments = p.numComments;
    this.numLikes = p.numLikes;
    this.liked = p.liked;
    if (p.highlight) this.highlight = new Highlight(p.highlight);
    if (p.comments) this.comments = p.comments.map((p) => new Post(p));
    if (p.parentPostId) this.parentPostId = p.parentPostId
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

  get isLikedByCurrentUser() {
    return this.liked;
  }

  removeTopic = (topicId: string) => {
    this.topics = this.topics.filter((t) => t.id !== topicId)
  }

  addTopic = (newTopic: ITopic) => {
    this.topics.unshift(new Topic(newTopic));
  }

  likePost = async () => {
    const res = await likePost(this.id);
    if (res.success) this.numLikes += 1
    return res
  }

  unlikePost = async () => {
    const res = await unlikePost(this.id);
    if (res.success) this.numLikes -= 1
    return res
  }
};
