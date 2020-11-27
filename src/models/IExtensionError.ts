export default interface IExtensionError extends Error {
  id: string;
  creationDatetime: number;
  readableMessage: string;
  message: string;
  stack: string;
}
