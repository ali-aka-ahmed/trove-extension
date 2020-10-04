import IUser from '../models/entities/User';

export default class User implements IUser {
  public id: string;
  public displayName: string
  public username: string; // alphanum and underscores, 3 < username < 20 characters
  public creationDatetime: number
  public color: string; // Hex code

  constructor(u: IUser) {
    this.id = u.id;
    this.displayName = u.displayName;
    this.username = u.username;
    this.creationDatetime = u.creationDatetime;
    this.color = u.color;
  }
};
