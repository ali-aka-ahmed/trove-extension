import io from 'socket.io-client';
import { BACKEND_URL } from '../config';
import INotification from '../models/INotification';
import { get, set } from '../utils/chrome/storage';

export const socket = io.connect(BACKEND_URL);

socket.on('notifications', (notifications: INotification[], meta: number) => {
  set({ 
    notifications,
    notificationDisplayIcon: meta
  });
});

socket.on('notification', (n: Notification) => {
  // console.log('notification received')
  get(['notifications', 'notificationDisplayIcon']).then((vals) => {
    const newNotifications = [n].concat(vals['notifications'])
    const popupOpen = chrome.extension.getViews({ type: "popup" }).length !== 0;
    if (!popupOpen) {
      set({
        notifications: newNotifications,
        notificationDisplayIcon: vals['notificationDisplayIcon'] + 1
      })
    } else set({ notifications: newNotifications })
  })
});

chrome.storage.onChanged.addListener((change) => {
  if (change.notificationDisplayIcon !== undefined) {
    if (change.notificationDisplayIcon.newValue !== undefined) {
      chrome.browserAction.setBadgeText({ 
        text: change.notificationDisplayIcon.newValue !== 0
          ? change.notificationDisplayIcon.newValue.toString() 
          : ""
      });
      chrome.browserAction.setBadgeBackgroundColor({ color: "#FF0000" });
    } else chrome.browserAction.setBadgeText({ text: "" });
  }
});
