import Color from "color";
import { addHighlight, modifyHighlight, removeHighlight } from "./highlightUtils";
import { areRangesEqual } from "./rangeUtils";

interface HighlightData {
  color: string;
  marks: HTMLElement[];
  range: Range;
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
  addHighlight = (
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
    if (!highlight) {
      // Add new highlight
      this.highlights.set
      marks = addHighlight(range, color, onMouseEnter, onMouseLeave);
    } else {
      if (!areRangesEqual(range, highlight.range)) {
        // If range is different, remove previous highlight and add new one
        removeHighlight(highlight.marks);
        marks = addHighlight(range, color, onMouseEnter, onMouseLeave);
      } else if (type !== highlight.type || color !== highlight.color) {
        // Range is same, but type of highlight is different, so just modify existing one
        modifyHighlight(highlight.marks, 'backgroundColor', color);
      }
    }

    this.highlights.set(rootId, { color, marks, range, type });
    return marks;
  }

  removeHighlight = (rootId: string) => {
    const highlight = this.highlights.get(rootId);
    if (highlight) {
      removeHighlight(highlight.marks);
      this.highlights.delete(rootId);
    }
  }

  // TODO: Need to get highlights by reverse chronological order
  removeAllHighlights = () => {
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
