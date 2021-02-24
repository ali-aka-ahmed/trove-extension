export const getCookie = (url: string, name: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    chrome.cookies.get({ url: url, name: name }, (cookie) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(`Failed to get cookie ${cookie?.name}. Error: ${err.message}`);
        reject(err);
      } else {
        resolve(cookie?.value || null);
      }
    });
  });
};
