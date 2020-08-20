// interface Like {
//   id: string;
//   name?: string;
//   userId?: string;
//   username?: string;
// };

export interface Post {
  id: number;
  comments?: Comment[];
  content?: string;
  // likes?: Like[];
  name?: string;
  userId?: string;
  username?: string;
  taggedUserIds?: string[];
  path?: string;
  domain?: string;
  url?: string;
  // locations in here (url) (position on page) -- determine best way to calculate and then store
};

export interface Reply {
  id: number;
  parentId?: string;
  content?: string;
  name?: string;
  userId?: string;
  username?: string;
  taggedUserIds?: string[];
};

export interface Comment {
  id: number;
  parentId?: string; 
  replies?: Reply[];
  content?: string;
  name?: string;
  userId?: string;
  username?: string;
  taggedUserIds?: string[];
};

// mongo check retrieving pattern (how to reduce server calls. retrive all the posts and comments and replies that we want to show)
// get top level posts
// perceived loading time is more important - soft load like fading in