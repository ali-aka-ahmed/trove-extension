import { Notification as INotification } from '../models/entities/Notification';
import { Post as IPost } from '../models/entities/Post';
import { User as IUser } from '../models/entities/User';

export const users: IUser[] = [
  {
    id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7', // needs to be unique
    displayName: 'Ali Ahmed',
    username: 'ali',
    creationDatetime: 1599520905274,
    color: '#52B2FA',
  },
  {
    id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93', // needs to be unique
    displayName: 'Akshath Sivaprasad',
    username: 'aki',
    creationDatetime: 1599520968596,
    color: '#9900EF',
  },
  {
    id: 'db6b621b-497c-4bd7-80ea-773e355c0eab', // needs to be unique
    displayName: 'Emily Clark',
    username: 'emily',
    creationDatetime: 1599521035609,
    color: '#8ED1FC',
  },
  {
    id: '9ed5d8c2-b7a0-40c8-bd10-1bdd9e7cfbec', // needs to be unique
    displayName: 'Test User 1',
    username: 'realTEST1',
    creationDatetime: 1599521094670,
    color: '#7BDCB5',
  }
];

export const posts: IPost[] = [
  {
    id: '4ff4be94-b0ac-4da5-9224-652993095c25',
    content: '@aki yo check this out lalalalala this is a big test hello world',
    creationDatetime: 1601178998080,
    creator: {
      id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
      displayName: 'Ali Ahmed',
      username: 'ali',
      creationDatetime: 1599521094670,
      color: '#52B2FA'
    },
    domain: 'akshath.me',
    url: 'https://akshath.me/',
    taggedUsers: [
      {
        id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93', // needs to be unique
        displayName: 'Akshath Sivaprasad',
        username: 'aki',
        creationDatetime: 1599520968596,
        color: '#9900EF',
      }
    ],
    numComments: 0,
    numLikes: 0,
    highlight: {
      id: '21a8a9d3-2d41-454e-ab5d-1e1ebb6abd93',
      context: '',
      creationDatetime: 1601178997080,
      text: '',
      range: '',
      domain: 'akshath.me',
      url: 'https://akshath.me/',
    }
  }
];

export const notifications: INotification[] = [
  {
    id: '1fe4be94-b0ac-4da5-8224-652993095c25',
    postId: '4ff4be94-b0ac-4da5-9224-652993095c25',
    sender: {
      id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7', // needs to be unique
      displayName: 'Ali Ahmed',
      username: 'ali',
      creationDatetime: 1599520905274,
      color: '#52B2FA',
    },
    action: 'tagged you',
    creationDatetime: 1601178998080,
    url: 'https://akshath.me/',
    content: '@aki yo check this out lalalalala this is a big test hello world',
    taggedUsers: [
      {
        id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93',
        displayName: 'Akshath Sivaprasad',
        username: 'aki',
        creationDatetime: 1599520968596,
        color: '#9900EF',
      }
    ]
  }
];
