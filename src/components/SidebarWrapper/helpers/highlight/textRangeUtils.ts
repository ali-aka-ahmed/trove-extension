export interface TextRange {
  context: string; // For display on the frontend
  text: string; // Text that was highlighted
  textStartIdx: number; // Start idx of text in uniqueText
  uniqueText: string; // Text that has been highlighted + prefix/suffix to make it unique
  url: string;
}

export const saveTextRange = (range: Range): TextRange => {
  const s = getSelection()!;
  s.removeAllRanges();
  s.addRange(range);
  const text = s.toString();

  // 
  const ss = new SelectionStore().saveSelection();
  const pageText = getPageText();
  ss.restoreSelection();

  //
  let uniqueText: string = text;
  let textStartIdx = 0;
  while (isTextUnique(uniqueText, pageText) !== 1) {
    textStartIdx += 5;
    ss.restoreSelection();
    const len = text.length + 2 * textStartIdx;
    s.collapseToStart();
    for (let i = 0; i < textStartIdx; i++) s.modify('move', 'left', 'character');
    for (let i = 0; i < len; i++) s.modify('extend', 'right', 'character');
    uniqueText = s.toString();
  }

  // Get context
  const context = '';

  //
  const url = window.location.href;
  const tr = { context, text, textStartIdx, uniqueText, url };
  console.log('saving textrange:', tr)
  return tr;
}

export const restoreTextRange = (tr: TextRange) => {
  // debugger
  const line = tr.uniqueText.split('\n').reduce((s1, s2) => s1.length >= s2.length ? s1 : s2);
  const uniqueText = tr.uniqueText.replace('\n\n', '\n');
  const s = getSelection()!;
  s.removeAllRanges();

  while (window.find(line, true, false)) {
    // Expand current selection (line) to uniqueText
    const m1 = uniqueText.indexOf(line);
    const e1 = uniqueText.length;
    for (let i = 0; i <= m1; i++) s.modify('move', 'left', 'character');
    for (let i = 0; i < e1; i++) s.modify('extend', 'right', 'character');

    // Shrink selected uniqueText to text
    if (s.toString() === tr.uniqueText) {
      if (tr.uniqueText === tr.text) return s.getRangeAt(0);
      const m2 = tr.textStartIdx - (tr.text.slice(0, tr.textStartIdx).length - tr.text.slice(0, tr.textStartIdx).replace('\n\n', '\n').length);
      const e2 = tr.text.replace('\n\n', '\n').length;
      s.collapseToStart();
      for (let i = 0; i < m2; i++) s.modify('move', 'right', 'character');
      for (let i = 0; i < e2; i++) s.modify('extend', 'right', 'character');
      return s.getRangeAt(0);
    } else {
      // Might have to restore to previous selection
    }
  }

  return null;
}

/**
 * Determine if given text is unique on current page.
 * @param text 
 * @param memoPageText
 * @returns -1 if text is not found
 *           0 if text is found multiple times
 *           1 if text is found only once
 */
export const isTextUnique = (text: string, memoPageText?: string): number => {
  const pageText = memoPageText || getPageText();
  const idx1 = pageText.indexOf(text);
  let isUnique = -1;
  if (idx1 !== -1) {
    const idx2 = pageText.lastIndexOf(text);
    isUnique = (idx1 === idx2) ? 1 : 0;
  }

  return isUnique;
}

export const getPageText = () => {
  const range = document.createRange();
  range.selectNodeContents(document.body);
  
  const selection = getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
  return selection.toString();
}

class SelectionStore {
  range: Range | null = null;

  saveSelection = () => {
    this.range = getSelection()!.getRangeAt(0).cloneRange();
    return this;
  }

  restoreSelection = () => {
    if (!this.range) return null;
    const s = getSelection()!;
    s.removeAllRanges();
    s.addRange(this.range);
    return this.range;
  }
}
