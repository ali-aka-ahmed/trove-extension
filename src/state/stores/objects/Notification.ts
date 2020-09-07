import { v4 as uuid } from 'uuid';
import { Creator as ICreator, default as IPost, TaggedUser as ITaggedUser } from '../../models/Post';
import userStore from '../UserStore';

export default class Notification {
  id: string;
  content: string;
  creator: ICreator
  postId: string;
  taggedUsers?: ITaggedUser[];
  time: string;
  url: string;
 
  public constructor(post: IPost) {
    this.id = uuid();
    this.content = post.content;
    this.creator = post.creator // sender
    this.postId = post.id
    this.taggedUsers = post.taggedUsers
    this.time = this.calculateTime(post.creationDatetime)
    this.url = post.url
  }

  get action(): string {
    const currUser = this.taggedUsers.find(taggedUser => taggedUser.id === userStore.userId)
    return currUser.replyingTag ? 'replied to you' : 'tagged you'
  }
  
  // what they did

  // you are tagged and either it's a reply or a post

  calculateTime = (postTime: number) => {
    const deltaMs = Date.now() - postTime;
    const deltaS = Math.round(deltaMs / 1000);
    const deltaMins = Math.round(deltaMs / 1000 / 60);
    const deltaHrs = Math.round(deltaMs / 1000 / 60 / 60);
    const deltaDate = new Date(postTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (deltaS < 60) return deltaS.toString();
    else if (deltaMins < 60) return deltaMins.toString();
    else if (deltaHrs < 24) return deltaHrs.toString();
    else return deltaDate
  }

  // render function that looks for @ and then takes the string, looks at that in the taggedUsers (username) and then constructs the html
}