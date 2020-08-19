interface Like {
  id: string;
  userId: string;
  nickname: string;
};

export default interface Comment {
  id: number;
  userId: string;
  content: string;
  refId?: string;
  likes: Like[];
  numComments: number;
};
