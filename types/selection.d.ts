declare global {
  interface Selection {
    // https://developer.mozilla.org/en-US/docs/Web/API/Selection/modify
    modify(
      alter: 'move' | 'extend',
      direction: 'forward' | 'backward' | 'left' | 'right',
      granularity:
        | 'character'
        | 'word'
        | 'sentence'
        | 'line'
        | 'paragraph'
        | 'lineboundary'
        | 'sentenceboundary'
        | 'paragraphboundary'
        | 'documentboundary',
    ): void;
  }
}

export {};
