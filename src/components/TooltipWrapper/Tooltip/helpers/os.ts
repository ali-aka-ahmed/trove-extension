export enum OS {
  Mac,
  Windows,
}

export const getOS = (): OS => {
  return navigator.userAgent.indexOf('Mac') !== -1 ? OS.Mac : OS.Windows;
};

export const getOsKeyChar = (): string => {
  return getOS() === OS.Mac ? '⌘' : 'ctrl';
};

export const isOsKeyPressed = (e: KeyboardEvent | React.KeyboardEvent): boolean => {
  return (getOS() === OS.Mac && e.metaKey) || (getOS() !== OS.Mac && e.ctrlKey);
};
