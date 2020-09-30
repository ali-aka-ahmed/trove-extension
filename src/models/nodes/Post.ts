import { User } from './User';

export interface Highlight {
  id: string;
  contextText: string; // Highlighted text + surrounding words for context
  creationDatetime: number;
  domain: string;
  highlightText: string;
  range: string; // Serialized Range object
  type: 'highlight';
  url: string
}

export interface Reference {
  id: string;
  referencerId: string;
  referenceeId: string;
  referenceeType: 'post' | 'highlight';
}

export interface TaggedUser {
  id: string;
  username: string;
  color: string;
}

export default interface Post {
  id: string;
  content: string;
  creationDatetime: number;
  creator: User; // id, displayName, username, color (no normalizedUsername, creationDatetime)
  creatorUserId: string;
  domain: string;
  type: 'post';
  url: string;
  mainReference?: Reference;
  parentId?: string;
  secondaryReferences?: Reference[];
  taggedUserIds?: string[]; // includes parent user ids (for replies)
  taggedUsers?: TaggedUser[];
}
