import ITopic from '../models/ITopic';

export default class Topic implements ITopic {
  public id: string;
  public creationDatetime: number;
  public lastEdited: number;
  public text: string;
  public normalizedText: string;
  public color: string; // hex code

  constructor(t: ITopic) {
    this.id = t.id;
    this.creationDatetime = t.creationDatetime;
    this.lastEdited = t.lastEdited;
    this.text = t.text;
    this.normalizedText = t.normalizedText;
    this.color = t.color;
  }
}
