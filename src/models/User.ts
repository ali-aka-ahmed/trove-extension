export default interface User {
  id: string; // needs to be unique
  displayName: string;
  username: string; // no spaces, 3 < username < 20 characters
  normalizedUsername: string; // lowercase version for search   
  creationDatetime: number;
  color: string;
};
