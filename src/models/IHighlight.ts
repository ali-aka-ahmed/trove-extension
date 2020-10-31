export interface XRange {
  startContainerPath: string;
  endContainerPath: string;
  startOffset: number;
  endOffset: number;
  isCollapsed?: boolean;
}

export default interface IHighlight {
  id: string;
  context: string; // Highlighted text + surrounding words for context
  creationDatetime: number;
  text: string;
  range: XRange; // Serialized Range object
  domain: string;
  url: string;
}
