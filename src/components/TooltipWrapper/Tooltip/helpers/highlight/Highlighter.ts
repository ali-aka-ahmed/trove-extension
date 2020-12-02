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
    rootId: string,
    colorStr: string | null='yellow', 
    type: HighlightType,
    onMouseEnter=(e: MouseEvent) => {},
    onMouseLeave=(e: MouseEvent) => {}
  ) => {
    const highlight = this.highlights.get(rootId);
    const color = colorStr ? this.getColor(colorStr, type) : 'yellow';
    let marks: HTMLElement[] = [];

    if (highlight) removeDOMHighlight(highlight.marks);
    marks = addDOMHighlight(range, color, onMouseEnter, onMouseLeave);
    this.highlights.set(rootId, { color, marks, type });
    return marks;
  }

  public modifyHighlight = (rootId: string, colorStr: string, type: HighlightType) => {
    const highlight = this.highlights.get(rootId);
    const color = this.getColor(colorStr, type);
    if (highlight) {
      modifyDOMHighlight(highlight.marks, 'backgroundColor', color);
      return highlight.marks;
    } else {
      console.error('Attempted to modify nonexistent highlight.');
      return [];
    }
  }

  public removeHighlight = (rootId: string) => {
    const highlight = this.highlights.get(rootId);
    if (highlight) {
      removeDOMHighlight(highlight.marks);
      this.highlights.delete(rootId);
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