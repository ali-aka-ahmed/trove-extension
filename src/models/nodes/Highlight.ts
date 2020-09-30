export default interface Highlight {
  id: string;
  contextText: string; // Highlighted text + surrounding words for context
  creationDatetime: number;
  highlightText: string;
  range: string; // Serialized Range object
}
