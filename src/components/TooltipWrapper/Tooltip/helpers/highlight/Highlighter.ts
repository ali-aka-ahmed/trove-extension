import Color from "color";
import { addDOMHighlight, modifyDOMHighlight, removeDOMHighlight } from ".";

interface HighlightData {
  color: string;
  marks: HTMLElement[];
  type: HighlightType;
}

export enum HighlightType {
  Default,
  Active // Click, hover, new post
}

export default class Highlighter {
  highlights: Map<string, HighlightData>; // id -> highlight data

  constructor() {
    this.highlights = new Map<string, HighlightData>();
  }

  // TODO: use shorter id
  public addHighlight = (
    range: Range, 
    id: string,
    colorStr: string | null='yellow', 
    type: HighlightType,
    onMouseEnter=(e: MouseEvent) => {},
    onMouseLeave=(e: MouseEvent) => {}
  ) => {
    const highlight = this.highlights.get(id);
    const color = colorStr ? this.getColor(colorStr, type) : 'yellow';
    let marks: HTMLElement[] = [];

    if (highlight) removeDOMHighlight(highlight.marks);
    marks = addDOMHighlight(range, color, onMouseEnter, onMouseLeave);
    this.highlights.set(id, { color, marks, type });
    return marks;
  }

  public modifyHighlight = (id: string, colorStr: string, type: HighlightType) => {
    const highlight = this.highlights.get(id);
    const color = this.getColor(colorStr, type);
    if (highlight) {
      modifyDOMHighlight(highlight.marks, 'backgroundColor', color);
      return highlight.marks;
    } else {
      console.error('Attempted to modify nonexistent highlight.');
      return [];
    }
  }

  public removeHighlight = (id: string) => {
    const highlight = this.highlights.get(id);
    if (highlight) {
      removeDOMHighlight(highlight.marks);
      this.highlights.delete(id);
    }
  }

  public removeAllHighlights = () => {
    for (const id of Object.keys(this.highlights)) {
      this.removeHighlight(id);
    }
  }

  private getColor = (colorStr: string, type: HighlightType): string => {
    const color = Color(colorStr);
    const rgba = (c: Color<string>, o: number) => `rgba(${c.red()},${c.green()},${c.blue()},${o})`;
    if (type === HighlightType.Default) return rgba(color, 0.25);
    return rgba(color, 0.65);
  }
}
