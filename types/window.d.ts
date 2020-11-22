declare interface Window { 
  // http://help.dottoro.com/ljkjvqqo.php
  find(
    textToFind: string,
    matchCase?: boolean,
    searchBackwards?: boolean,
    wrapAround?: boolean,
    wholeWord?: boolean,
    searchInFrames?: boolean,
    showDialog?: boolean
  ): boolean;
}
