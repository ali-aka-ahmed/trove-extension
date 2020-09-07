export default interface User {
  id: string; // needs to be unique
  displayName: string;
  username: string;
  normalizedUsername: string; // lowercase version for search   
  creationDatetime: number;
  color: string;
};
