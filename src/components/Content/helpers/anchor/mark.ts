import { v4 as uuid } from 'uuid';

/**
 * Ids of different types of marks. Making the assumption we can only have one instance of each
 * type visiable at once.
 */
export enum MarkId {
  Post    = 'TbdMark__PostAnchor',
  NewPost = 'TbdMark__NewPostAnchor'
}

export enum MarkDataKey {
  FirstMarkId = 'tbdProgenitorId',
  ThisMarkId  = 'tbdId',
  NextMarkId  = 'tbdSuccessorId'
};

export const mark = (range: Range, id: MarkId, color?: string) => {
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
    if (hasContent && node.nodeType === Node.TEXT_NODE && !isTable(node)) {
      let wrapper = node.previousSibling;
      if (!wrapper || marks.length === 0 || wrapper !== marks[marks.length - 1]) {
        // Create next mark in chain
        const mark = document.createElement('mark'); 
        mark.dataset[MarkDataKey.ThisMarkId] = uuid();
        if (marks.length === 0) {
          mark.id = id;
        } else {
          mark.dataset[MarkDataKey.FirstMarkId] = marks[0].id;
          const prevMark = marks[marks.length - 1];
          prevMark.dataset[MarkDataKey.NextMarkId] = mark.dataset[MarkDataKey.ThisMarkId];
        }

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

const isTable = (node: Node) => {
  const types = [
    HTMLTableElement, 
    HTMLTableRowElement, 
    HTMLTableColElement, 
    HTMLTableSectionElement
  ];
  return types.some(type => node.parentNode instanceof type);
}

const isTerminal = (node: Node) => {
  const types = [
    HTMLScriptElement,
    HTMLStyleElement,
    HTMLSelectElement
  ];
  return types.some(type => node.parentNode instanceof type);
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
