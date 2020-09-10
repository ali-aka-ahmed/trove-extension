import IPost from '../models/Post';
import IUser from '../models/User';

export const users: IUser[] = [
  {
    id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7', // needs to be unique
    displayName: 'Ali Ahmed',
    username: 'ali',
    normalizedUsername: 'ali', // lowercase version for search   
    creationDatetime: 1599520905274,
    color: '#0D77E2',
  },
  {
    id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93', // needs to be unique
    displayName: 'Akshath Sivaprasad',
    username: 'aki',
    normalizedUsername: 'aki', // lowercase version for search   
    creationDatetime: 1599520968596,
    color: '#9900EF',
  },
  {
    id: 'db6b621b-497c-4bd7-80ea-773e355c0eab', // needs to be unique
    displayName: 'Emily Clark',
    username: 'emily',
    normalizedUsername: 'emily', // lowercase version for search   
    creationDatetime: 1599521035609,
    color: '#8ED1FC',
  },
  {
    id: '9ed5d8c2-b7a0-40c8-bd10-1bdd9e7cfbec', // needs to be unique
    displayName: 'Test User 1',
    username: 'realTEST1',
    normalizedUsername: 'realtest1', // lowercase version for search   
    creationDatetime: 1599521094670,
    color: '#7BDCB5',
  }
];

export const posts: IPost[] = [
  {
    id: '4ff4be94-b0ac-4da5-9224-652993095c25',
    content: '@aki yo check this out',
    creationDatetime: 1599521212817,
    creator: {
      id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
      displayName: 'Ali Ahmed',
      username: 'ali',
      color: '#0D77E2'
    },
    creatorUserId: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
    replies: [],
    taggedUserIds: ['30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93'],
    taggedUsers: [
      {
        id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93',
        username: 'aki',
        isTaggedInReply: false,
        color: '#9900EF'
      }
    ],
    url: 'https://github.com/airbnb/css#comments'
  }
];
