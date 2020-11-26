import { TextRange } from '../components/TooltipWrapper/Tooltip/helpers/highlight/textRangeUtils';

export default interface IHighlight {
  id: string;
  creationDatetime: number;
  textRange: TextRange; // Serialized Range object
  domain: string;
  url: string;
}
