export interface XRange {
  startContainerPath: string;
  endContainerPath: string;
  startOffset: number;
  endOffset: number;
  isCollapsed?: boolean;
}

/**
 * Convert Range to XRange. Useful for serialization.
 * @param range
 */
export const getXRangeFromRange = (range: Range): XRange => ({
  startContainerPath: getXPathFromNode(range.startContainer),
  endContainerPath: getXPathFromNode(range.endContainer),
  startOffset: range.startOffset,
  endOffset: range.endOffset,
});

/**
 * Convert XRange to Range.
 * @param xRange
 */
export const getRangeFromXRange = (xRange: XRange): Range | null => {
  // console.log(xRange)
  const startContainer = getNodeFromXPath(xRange.startContainerPath);
  const endContainer = getNodeFromXPath(xRange.endContainerPath);
  if (!startContainer || !endContainer) {
    console.error('Unable to construct Range because bound node is invalid.');
    return null;
  }

  const range = document.createRange();
  range.setStart(startContainer, xRange.startOffset);
  range.setEnd(endContainer, xRange.endOffset);
  return range;
};

export const areRangesEqual = (r1: Range, r2: Range): boolean => {
  return (
    r1.compareBoundaryPoints(Range.START_TO_START, r2) === 0 &&
    r1.compareBoundaryPoints(Range.END_TO_END, r2) === 0
  );
};

/**
 * Get XPath for given node.
 * @param node
 */
const getXPathFromNode = (node: Node): string => {
  const paths: string[] = [];
  for (
    let n: Node | null = node;
    n && (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE);
    n = n.parentNode
  ) {
    let nodeId: string;
    const tagName = n.nodeType === Node.ELEMENT_NODE ? n.nodeName.toLowerCase() : 'text()';
    if (n.nodeType === Node.ELEMENT_NODE && (nodeId = (n as Element).id)) {
      // Use id as root if it is globally unique
      if (n.ownerDocument?.querySelectorAll(`#${nodeId}`).length === 1) {
        paths.push(`/${tagName}[@id="${nodeId}"]`);
        break;
      }

      // If not, use id as predicate if it is unique amongst siblings
      if (
        n.parentNode &&
        !Array.from(n.parentNode.children).some((child) => child !== n && child.id === nodeId)
      ) {
        paths.push(`${tagName}[@id="${nodeId}"]`);
        continue;
      }
    }

    // Use index as predicate to differentiate between siblings
    let idx: number = 1;
    for (let sibling = n.previousSibling; sibling; sibling = sibling.previousSibling) {
      if (n.nodeType === sibling.nodeType && n.nodeName === sibling.nodeName) idx++;
    }

    paths.push(`/${tagName}[${idx}]`);
  }

  paths.reverse(); //console.log(node, paths)
  return paths.length > 0 ? `/${paths.join('/')}` : '';
};

/**
 * Evaluate given XPath to a node.
 * @param xpath
 */
const getNodeFromXPath = (xpath: string): Node | null => {
  const evaluator = new XPathEvaluator();
  const result = evaluator.evaluate(
    xpath,
    document.documentElement,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null,
  );
  return result.singleNodeValue;
};
