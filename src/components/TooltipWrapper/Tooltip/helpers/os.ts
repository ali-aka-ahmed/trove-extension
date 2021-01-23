export enum OS {
  Mac,
  Windows,
}

export const getOS = (): OS => {
  return navigator.userAgent.indexOf('Mac') !== -1 ? OS.Mac : OS.Windows;
};
