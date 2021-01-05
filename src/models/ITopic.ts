export default interface ITopic {
  id: string;
  creationDatetime: number;
  lastEdited: number;
  text: string;
  normalizedText: string; // lowercase, trimmed. Unique
  color: string; // hex code
}
