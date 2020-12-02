import { HighlightType } from '../components/TooltipWrapper/Tooltip/helpers/highlight/Highlighter';
import { TextRange } from '../components/TooltipWrapper/Tooltip/helpers/highlight/textRange';
import IHighlight from '../models/IHighlight';

export default class Highlight implements IHighlight {
  public id: string;
  public creationDatetime: number;
  public textRange: TextRange; // Serialized Range object
  public domain: string;
  public type: HighlightType;
  public url: string;

  constructor(h: IHighlight, type: HighlightType=HighlightType.Default) {
    this.id = h.id;
    this.creationDatetime = h.creationDatetime;
    this.textRange = h.textRange;
    this.domain = h.domain;
    this.type = type;
    this.url = h.url;
  }
};
