import { XRange } from '../components/TooltipWrapper/Tooltip/helpers/highlight/rangeUtils';
import IHighlight from '../models/IHighlight';

export default class Highlight implements IHighlight {
  public id: string;
  public creationDatetime: number;
  public text: string;
  public range: XRange; // Serialized Range object
  public domain: string;
  public url: string;

  constructor(h: IHighlight) {
    this.id = h.id;
    this.creationDatetime = h.creationDatetime;
    this.text = h.text;
    this.range = h.range;
    this.domain = h.domain;
    this.url = h.url;
  }
};
