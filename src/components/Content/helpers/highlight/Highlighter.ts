import hexToRgba from "hex-to-rgba";
import { addHighlight, modifyHighlight, removeHighlight } from "./highlight";

export default class Highlighter {
  highlights: Map<string, HighlightType>; // id -> highlight type

  constructor() {
    this.highlights = new Map<string, HighlightType>();
  }

  addHighlight = (range: Range, rootId: string, color: string='yellow', type: HighlightType) => {
    const prevType = this.highlights.get(rootId);
    if (prevType) {
      if (prevType !== type) {
        modifyHighlight(rootId, 'backgroundColor', this.getColor(color, type));
      }
    } else {
      addHighlight(range, rootId, color);
    }

    this.highlights.set(rootId, type);
  }

  removeHighlight = (rootId: string) => {
    removeHighlight(rootId);
    this.highlights.delete(rootId);
  }

  removeAllHighlights = () => {
    for (const id of Object.keys(this.highlights)) {
      removeHighlight(id);
    }
  }

  private getColor = (color: string, type: HighlightType) => {
    if (type === HighlightType.Default) return hexToRgba(color, 0.1);
    return hexToRgba(color, 0.25);
  }
}

export enum HighlightType {
  Default,
  Active // Click, hover, new post
}
