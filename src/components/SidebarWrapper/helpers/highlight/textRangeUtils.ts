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
  let uniqueText: string = text;
  let textStartIdx = 0;
  const ss = new SelectionStore().saveSelection();
  while (!isTextUnique(uniqueText)) {
    textStartIdx += 5;
    ss.restoreSelection();
    const len = text.length + 2 * textStartIdx;
    for (let i = 0; i <= textStartIdx; i++) s.modify('move', 'left', 'character');
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
  const s = getSelection()!;
  const line = tr.uniqueText.split('\n').reduce((s1, s2) => s1.length >= s2.length ? s1 : s2);
  s.removeAllRanges();
  while (window.find(line, true, false)) {
    // Expand current selection (line) to uniqueText
    const m1 = tr.uniqueText.indexOf(line);
    const e1 = tr.uniqueText.length;
    for (let i = 0; i <= m1; i++) s.modify('move', 'left', 'character');
    for (let i = 0; i < e1; i++) s.modify('extend', 'right', 'character');
    if (s.toString() === tr.uniqueText) {
      // Shrink selected uniqueText to text
      const m2 = tr.textStartIdx;
      const e2 = tr.text.length;
      s.modify('move', 'left', 'character');
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
 * Determine if given text is unique on current page. This method modifies selection, so save and
 * restore any existing selection(s) if necessary.
 * @param text 
 * @returns -1 if text is not found
 *           0 if text is found multiple times
 *           1 if text is found only once
 */
export const isTextUnique = (text: string): number => {
  // Clear selection (messes with window.find start point) and search for text
  getSelection()?.removeAllRanges();
  const find = () => window.find(text, true, false);
  const firstResult = find();
  if (!firstResult) return -1;

  // Determine if text repeats or is unique
  const isUnique = firstResult && !find();
  return isUnique ? 1 : 0;
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
