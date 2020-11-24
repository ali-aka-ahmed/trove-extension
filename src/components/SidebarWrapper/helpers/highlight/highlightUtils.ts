import { v4 as uuid } from 'uuid';

export enum MarkDataKey {
  RootMarkId = 'tbdRootId',
  ThisMarkId  = 'tbdId',
  NextMarkId  = 'tbdNextId'
};

const MARK_CLASS_NAME = 'TbdMark';

export const addHighlight = (
  range: Range, 
  rootId: string, 
  color: string='yellow', 
  onMouseEnter=(e: MouseEvent) => {},
  onMouseLeave=(e: MouseEvent) => {}
) => {
  rootId = getCssCompatibleId(rootId);
  let start = range.startContainer;
  let end = range.endContainer;
  let hasContent = true;

  // Determine end
  if (range.endOffset === 0) { 
    while (!end.previousSibling && end.parentNode !== range.commonAncestorContainer) {
      end = end.parentNode!;
    }

    end = end.previousSibling!;
  } else if (end.nodeType === Node.TEXT_NODE) {
    if (range.endOffset < end.nodeValue!.length) {
      (end as Text).splitText(range.endOffset);
    }
  } else if (range.endOffset > 0) {
    end = end.childNodes.item(range.endOffset - 1);
  }

  // Determine start
  if (start.nodeType === Node.TEXT_NODE) {
    if (range.startOffset === start.nodeValue!.length) {
      hasContent = false;
    } else if (range.startOffset > 0) {
      start = (start as Text).splitText(range.startOffset);

      if (end === start.previousSibling) {
        end = start;
      }
    }
  } else if (range.startOffset < start.childNodes.length) {
    start = start.childNodes.item(range.startOffset);
  } else {
    hasContent = false;
  }

  // This is where the magic happens
  const marks: HTMLElement[] = [];
  for (let done = false, node = start; !done; ) {
    if (
      hasContent
      && node.nodeType === Node.TEXT_NODE
      && /\S/.test(node.nodeValue || '')
      && !isTable(node)
    ) {
      let wrapper = node.previousSibling;
      if (!wrapper || marks.length === 0 || wrapper !== marks[marks.length - 1]) {
        // Create next mark in chain
        const mark = document.createElement('mark'); 
        mark.className = MARK_CLASS_NAME;
        mark.style.backgroundColor = color;
        mark.dataset[MarkDataKey.ThisMarkId] = getCssCompatibleId(uuid());
        if (marks.length === 0) {
          mark.id = rootId;
        } else {
          mark.dataset[MarkDataKey.RootMarkId] = marks[0].id;
          const prevMark = marks[marks.length - 1];
          prevMark.dataset[MarkDataKey.NextMarkId] = mark.dataset[MarkDataKey.ThisMarkId];
        }

        // Add handlers
        mark.addEventListener('mouseenter', onMouseEnter);
        mark.addEventListener('mouseleave', onMouseLeave);
        marks.push(mark);

        // Position new wrapper accordingly
        wrapper = mark;
        node.parentNode?.insertBefore(wrapper, node);
      }

      // Move node under wrapper
      wrapper.appendChild(node);
      node = wrapper.lastChild!;
      hasContent = false;
    }

    if (node === end && (!hasContent || !end.hasChildNodes())) {
      done = true;
    }

    if (isTerminal(node)) {
      hasContent = false;
    }

    if (hasContent && node.firstChild) {
      node = node.firstChild!;
    } else if (node.nextSibling) {
      node = node.nextSibling;
      hasContent = true;
    } else {
      node = node.parentNode!;
      hasContent = false;
    }
  }
}

export const removeHighlight = (id: string) => {
  const marks = getHighlight(id);
  for (const mark of marks) {
    // Move each child of mark and merge if appropriate
    while (mark.hasChildNodes()) {
      const origNode = mark.parentNode?.insertBefore(mark.firstChild!, mark);
      if (origNode?.nodeType === Node.TEXT_NODE) {
        mergeTextNodes(origNode);
      }
    }

    // Clean up mark and merge text nodes around mark if possible
    const prevSibling = mark.previousSibling;
    mark.parentNode?.removeChild(mark);
    if (prevSibling && prevSibling.nodeType === Node.TEXT_NODE) {
      mergeTextNodes(prevSibling)
    }
  }

  return marks;
}

export const modifyHighlight = (id: string, style: string, value: string) => {
  const marks = getHighlight(id);
  for (const mark of marks) {
    mark.style[style] = value;
  }
}

const getHighlight = (id: string) => { 
  id = getCssCompatibleId(id);
  const mark = document.getElementById(id);
  if (!mark) return [];

  // Get root from data attribute or treat this mark as root otherwise
  const root = !!mark 
    && !!mark.dataset[MarkDataKey.RootMarkId] 
    && document.getElementById(mark.dataset[MarkDataKey.RootMarkId]!);
  const marks: HTMLElement[] = [root || mark];

  // Follow mark chain and add each mark to list
  let nextMarkId: string | undefined;
  while (nextMarkId = marks[marks.length-1].dataset[MarkDataKey.NextMarkId]) {
    const nextMark = document.querySelector(`[${attr(MarkDataKey.ThisMarkId)}="${nextMarkId}"]`);
    if (nextMark) marks.push(nextMark as HTMLElement);
  }

  return marks;
}

const isTable = (node: Node) => {
  const types = [
    HTMLTableElement, 
    HTMLTableRowElement, 
    HTMLTableColElement, 
    HTMLTableSectionElement
  ];
  return types.some(type => node && node.parentNode instanceof type);
}

const isTerminal = (node: Node) => {
  const types = [
    HTMLScriptElement,
    HTMLStyleElement,
    HTMLSelectElement
  ];
  return types.some(type => node instanceof type);
}

const mergeTextNodes = (node: Node) => {
  if (node.nodeType !== Node.TEXT_NODE) return;

  // Check if we can merge node with next sibling and remove sibling
  const nextNode = node.nextSibling;
  if (nextNode && nextNode.nodeType === Node.TEXT_NODE) {
    node.textContent = (node.textContent || '') + (nextNode.textContent || '');
    nextNode.parentNode?.removeChild(nextNode);
  }

  // Check if we can merge node with prev sibling and remove node
  const prevNode = node.previousSibling;
  if (prevNode && prevNode.nodeType === Node.TEXT_NODE) {
    prevNode.textContent = (prevNode.textContent || '') + (node.textContent || '');
    node.parentNode?.removeChild(node);
  }
}

type valueof<T> = T[keyof T];

/**
 * Add `data-` prefix and kebab-case given `element.dataset` key to construct data attribute name.
 * 
 * Ex: `'tbdId' => 'data-tbd-id'`
 * @param attr 
 */
const attr = (attr: valueof<typeof MarkDataKey>) => {
  return 'data-' + attr.replace(/([A-Z])/g, '-$1').toLowerCase();
}

/**
 * Since querySelector uses CSS3 selectors, ids can't start with a number.
 * @param id 
 */
const getCssCompatibleId = (id: string) => {
  return 'trove-' + id;
}
