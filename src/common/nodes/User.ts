/**
 * @interface User
 */
export interface User {
  id: string; // needs to be unique
  displayName: string;
  username: string; // alphanum and underscores, 3 < username < 20 characters
  normalizedUsername: string; // lowercase version for search
  creationDatetime: number;
  color: string; // Hex code
}
