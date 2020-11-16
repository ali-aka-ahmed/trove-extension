const isTextUnique = (text: string): boolean => {
  return window.find(text, true) && !window.find(text, true);
}

const expandRange = (range: Range): void => {
  
}