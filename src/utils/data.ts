import { Notification } from "../models/nodes/Notification";
import Post from "../models/nodes/Post";
import { User } from "../models/nodes/User";

export const users: User[] = [
  {
    id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7', // needs to be unique
    displayName: 'Ali Ahmed',
    username: 'ali',
    normalizedUsername: 'ali', // lowercase version for search   
    creationDatetime: 1599520905274,
    color: '#52B2FA',
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

export const posts: Post[] = [
  {
    id: '4ff4be94-b0ac-4da5-9224-652993095c25',
    content: '@aki yo check this out lalalalala this is a big test hello world',
    creationDatetime: 1601178998080,
    creator: {
      id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
      displayName: 'Ali Ahmed',
      username: 'ali',
      normalizedUsername: 'ali',
      creationDatetime: 1599521094670,
      color: '#52B2FA'
    },
    creatorUserId: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
    domain: 'akshath.me',
    taggedUserIds: ['30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93'],
    taggedUsers: [
      {
        id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93',
        username: 'aki',
        color: '#9900EF'
      }
    ],
    type: 'post',
    url: 'https://akshath.me/'
  }
];

export const notifications: Notification[] = [
  {
    id: '1fe4be94-b0ac-4da5-8224-652993095c25',
    postId: '4ff4be94-b0ac-4da5-9224-652993095c25',
    receiverId: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
    sender: {
        id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93',
        displayName: 'Akshath Sivaprasad',
        username: 'aki',
        normalizedUsername: 'aki',
        creationDatetime: 1599520968596,
        color: '#9900EF',
    },
    action: 'mentioned you',
    creationDatetime: 1599774135941,
    url: 'https://github.com/airbnb/css#comments',
    content: '@ali yo what is upith my homie g',
    taggedUsers: [
      {
        id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
        username: 'ali',
        color: '#52B2FA'
      }
    ]
  }
];
