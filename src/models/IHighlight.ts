import { XRange } from '../components/SidebarWrapper/helpers/highlight/rangeUtils';

export default interface IHighlight {
  id: string;
  creationDatetime: number;
  text: string;
  range: XRange; // Serialized Range object
  domain: string;
  url: string;
}
