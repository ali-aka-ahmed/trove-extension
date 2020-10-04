import IHighlight from '../models/entities/IHighlight';

export default class Highlight implements IHighlight {
  public id: string;
  public context: string; // Highlighted text + surrounding words for context
  public creationDatetime: number;
  public text: string;
  public range: string; // Serialized Range object
  public domain: string;
  public url: string;

  constructor(h: IHighlight) {
    this.id = h.id;
    this.context = h.context;
    this.creationDatetime = h.creationDatetime;
    this.text = h.text;
    this.range = h.range;
    this.domain = h.domain;
    this.url = h.url;
  }
};
