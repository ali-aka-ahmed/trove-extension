import hexToRgba from "hex-to-rgba";
import { addHighlight, modifyHighlight, removeHighlight } from "./highlightUtils";
import { areRangesEqual } from "./rangeUtils";

interface HighlightData {
  color: string;
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

  addHighlight = (range: Range, rootId: string, color: string='yellow', type: HighlightType) => {
    const hd = this.highlights.get(rootId);
    if (!hd) {
      // Add new highlight
      addHighlight(range, rootId, color);
    } else {
      if (!areRangesEqual(range, hd.range)) {
        // If range is different, remove previous highlight and add new one
        removeHighlight(rootId);
        addHighlight(range, rootId, color);
      } else if (type !== hd.type || color !== hd.color) {
        // Range is same, but type of highlight is different, so just modify existing one
        modifyHighlight(rootId, 'backgroundColor', this.getColor(color, type));
      }
    }

    this.highlights.set(rootId, { color, range, type });
  }

  removeHighlight = (rootId: string) => {
    if (this.highlights.get(rootId)) {
      removeHighlight(rootId);
      this.highlights.delete(rootId);
    }
  }

  removeAllHighlights = () => {
    for (const id of Object.keys(this.highlights)) {
      this.removeHighlight(id);
    }
  }

  private getColor = (color: string, type: HighlightType) => {
    if (type === HighlightType.Default) return hexToRgba(color, 0.1);
    return hexToRgba(color, 0.25);
  }
}
