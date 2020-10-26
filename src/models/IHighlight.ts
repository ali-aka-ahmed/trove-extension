import { XRange } from "../components/Content/helpers/utils";

export default interface IHighlight {
  id: string;
  context: string; // Highlighted text + surrounding words for context
  creationDatetime: number;
  text: string;
  range: XRange; // Serialized Range object
  domain: string;
  url: string;
}
