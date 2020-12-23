import IUser from '../models/IUser';

export default class User implements IUser {
  public id: string;
  public displayName: string
  public username: string; // alphanum and underscores, 3 < username < 20 characters
  public creationDatetime: number
  public color: string; // Hex code
  public followers?: number;
  public following?: number;
  public likes?: number;

  constructor(u: IUser) {
    this.id = u.id;
    this.displayName = u.displayName;
    this.username = u.username;
    this.creationDatetime = u.creationDatetime;
    this.color = u.color;
    if (u.followers !== undefined) this.followers = u.followers;
    if (u.following !== undefined) this.following = u.following;
    if (u.likes !== undefined) this.likes = u.likes;
  }

  decrementLikes = () => {
    if (this.likes !== undefined) this.likes -= 1;
  }

  incrementLikes = () => {
    if (this.likes !== undefined) this.likes += 1;
  }
};
