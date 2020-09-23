export const mark = (range: Range) => {
  let start = range.startContainer;
  let end = range.endContainer;

  // Determine end
  if (range.endOffset === 0) {
    // There is no included content in this node, so prune it from the range
    while (!end.previousSibling && end.parentNode !== range.commonAncestorContainer) {
      end = end.parentNode!;
    }

    if (end.previousSibling) end = end.previousSibling;
  } else if (end.nodeType === Node.TEXT_NODE && range.endOffset < (end.nodeValue?.length || 0)) {
    // Remove text after offset
    (end as Text).splitText(range.endOffset);
  } else if (range.endOffset <= end.childNodes.length) {
    // Use node specified by end offset (exclusive)
    end = end.childNodes.item(range.endOffset - 1);
  }

  // Determine start
  const isTextNode = start.nodeType === Node.TEXT_NODE;
  const bound = isTextNode ? (start as Text).nodeValue?.length || 0 : start.childNodes.length;
  const hasContent = range.startOffset !== bound;
  if (!hasContent) {
    // Do nothing because there is no included content in this node
  } else if (isTextNode && range.startOffset > 0) {
    // Remove text before offset
    start = (start as Text).splitText(range.startOffset);
    if (end === start.previousSibling) start = end; // TODO: do we need this?
  } else if (range.startOffset < start.childNodes.length) {
    // Use node specified by end offset (inclusive)
    start = start.childNodes.item(range.startOffset);
  }

  // TODO: do we need this?
  range.setStart(range.startContainer, 0);
  range.setEnd(range.startContainer, 0);

  // This is where the magic happens
  const elements: Node[] = [];
  for (let done = false, node = start; !done; ) {
    if (hasContent && node.nodeType === Node.TEXT_NODE && !isTable(node)) {
      let wrapper = node.previousSibling;
      if (!wrapper || elements.length === 0 || wrapper !== elements[elements.length - 1]) {
        // Add wrapper
        const element = document.createElement('mark');
        if (elements.length === 0 && )
      }
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