import { TextRange } from '../components/TooltipWrapper/Tooltip/helpers/highlight/textRange';
import IHighlight from '../models/IHighlight';

export default class Highlight implements IHighlight {
  public id: string;
  public creationDatetime: number;
  public textRange: TextRange; // Serialized Range object
  public domain: string;
  public url: string;

  constructor(h: IHighlight) {
    this.id = h.id;
    this.creationDatetime = h.creationDatetime;
    this.textRange = h.textRange;
    this.domain = h.domain;
    this.url = h.url;
  }
};
