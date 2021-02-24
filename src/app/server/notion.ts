export const getPageNames = (limit?: number): string[] => {
  return ['Investing', 'Politics', 'Read later'];
};

export const getPageNamesByPrefix = (prefix: string, limit?: number): string[] => {
  return [`${prefix} 1`, `${prefix} 2`, `${prefix} 3`];
};
