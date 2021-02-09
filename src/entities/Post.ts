import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import IPost from '../models/IPost';
import ITopic from '../models/ITopic';
import { MessageType, sendMessageToExtension } from '../utils/chrome/tabs';
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
  public comments: Post[];
  public liked: boolean;
  public id: string;
  public creationDatetime: number;
  public creator: User;
  public domain: string;
  public url: string;
  public parentPostId?: string;

  public constructor(p: IPost) {
    this.id = p.id;
    if (p.content.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
      this.content = '';
    } else this.content = p.content;
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
    if (p.parentPostId) this.parentPostId = p.parentPostId;
    if (p.comments) {
      this.comments = p.comments.map((p) => new Post(p));
    } else this.comments = [];
  }

  get timeAgo() {
    TimeAgo.addLocale(en);
    const timeAgo = new TimeAgo('en-US');
    return timeAgo.format(this.creationDatetime, 'twitter');
    // return displayRelativeTime(this.creationDatetime)
  }

  get isTopOfThread() {
    return !this.parentPostId;
  }

  get isComment() {
    return !!this.parentPostId;
  }

  get displayUrl(): string {
    let hostname = new URL(this.url).hostname;
    if (hostname.slice(0, 4) === 'www.') hostname = hostname.slice(4);
    let path = new URL(this.url).pathname;
    if (path.slice(-1) === '/') path = path.slice(0, -1)
    return `${hostname}${path}`
  }

  removeTopic = (topicId: string) => {
    this.topics = this.topics.filter((t) => t.id !== topicId);
  };

  addTopic = (newTopic: ITopic) => {
    this.topics.unshift(new Topic(newTopic));
  };

  likePost = async () => {
    this.numLikes += 1;
    this.liked = true;
    return await sendMessageToExtension({
      type: MessageType.LikePost,
      id: this.id,
    });
  };

  unlikePost = async () => {
    this.numLikes -= 1;
    this.liked = false;
    return await sendMessageToExtension({
      type: MessageType.UnlikePost,
      id: this.id,
    });
  };

  addComment = async (comment: Post) => {
    this.numComments += 1;
    this.comments.unshift(comment);
  }

  deleteComment = async (commentId: string) => {
    this.numComments -= 1;
    const i = this.comments.findIndex((c) => c.id === commentId);
    if (i > -1) this.comments.splice(i, 1);
  }
}
