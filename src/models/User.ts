export default interface User {
  id: string; // needs to be unique
  displayName: string;
  username: string; // no spaces, less than 20 characters
  normalizedUsername: string; // lowercase version for search   
  creationDatetime: number;
  color: string;
};
