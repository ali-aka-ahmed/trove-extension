/**
 * Get XPath for given node.
 * @param node
 */
export const getXPath = (node: Node) => {
  const paths: string[] = [];

  let nodeId: string;
  for (
    let n: Node | null = node; 
    n && (n.nodeType === Node.ELEMENT_NODE || n.nodeType === Node.TEXT_NODE); 
    n = n.parentNode
  ) {
    const name = _getName(n);
    if (n.nodeType === Node.ELEMENT_NODE && (nodeId = (n as Element).id)) {
      // Use id as root if it is globally unique
      if (n.ownerDocument?.querySelectorAll(`#${nodeId}`).length === 1) {
        paths.push(`/${name}[@id="${nodeId}"]`);
        break;
      }

      // If not, use id as predicate if it is unique amongst siblings
      if (
        n.parentNode 
        && !Array.from(n.parentNode.children).some(child => child !== n && child.id === nodeId)
      ) {
        paths.push(`${name}[@id="${nodeId}"]`);
        continue;
      }
    }
    
    // Use index as predicate to differentiate between siblings
    let idx: number = 1;
    for (let sibling = n.previousSibling; sibling; sibling = sibling.previousSibling) {
      if (n.nodeType === sibling.nodeType && n.nodeName === sibling.nodeName) idx++;
    }

    paths.push(`/${name}[${idx}]`);
  }

  paths.reverse();
  return paths.length > 0 ? `/${paths.join('/')}` : '';
}

const _getName = (node: Node) => {
  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      return node.nodeName.toLowerCase();
    case Node.TEXT_NODE:
      return 'text()';
    default:
      console.error(`Invalid node type: ${node.nodeType}`);
  }
}
