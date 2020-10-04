export default interface IUser {
  id: string; // needs to be unique
  displayName: string;
  username: string; // alphanum and underscores, 3 < username < 20 characters
  creationDatetime: number;
  color: string; // Hex code
}
