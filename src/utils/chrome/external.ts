import { ORIGIN, VALID_DOMAINS } from '../../config';
import { getAllTabs, Message } from './tabs';

export const sendMessageToWebsite = (message: Message) => {
  getAllTabs().then((tabs) => {
    tabs.forEach((tab) => {
      const domain = new URL(tab.url!).hostname;
      const tabId = tab.id!;
      if (VALID_DOMAINS.includes(domain)) {
        chrome.tabs.executeScript(
          tabId,
          {
            code:
              '(' +
              ((args: { message: Message; origin: string }) => {
                const message = args.message;
                const origin = args.origin;
                window.postMessage(message, origin);
                return { success: true };
              }) +
              ')(' +
              JSON.stringify({ message, origin: ORIGIN }) +
              ');',
          },
          (results) => results,
        );
      }
    });
  });
};
