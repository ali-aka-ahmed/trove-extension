import Color from 'color';
import Post from '../../../../../entities/Post';
import { addDOMHighlight, modifyDOMHighlight, removeDOMHighlight } from './domHighlight';
import { getRangeFromTextRange } from './textRange';

interface HighlightData {
  marks: HTMLElement[];
  post: Post;
  type: HighlightType;
  handlers: { [event: string]: (e: MouseEvent) => void };
}

interface HighlightTempData {
  marks: HTMLElement[];
  type: HighlightType;
  color: string;
}

export enum HighlightType {
  Default,
  Active, // Click, hover, new post
}

export default class Highlighter {
  highlights: Map<string, HighlightData>; // id -> highlight data
  highlightTemp: HighlightTempData | null;

  constructor() {
    this.highlights = new Map<string, HighlightData>();
    this.highlightTemp = null;
  }

  public addHighlight = (post: Post, type: HighlightType = HighlightType.Default) => {
    if (!post.highlight || !post.creator) {
      console.error('Tried to add highlight for post without required data. Post id:', post.id);
      return null;
    }

    // Remove highlight if it is already on the page since it is being replaced
    const id = post.highlight.id;
    this.removeHighlight(id);

    // Calculate range
    const color = this.getColor(post.creator.color, type);
    let range: Range | null;
    try {
      range = getRangeFromTextRange(post.highlight.textRange);
      getSelection()!.removeAllRanges();
      if (!range) {
        // TODO: Handle case where range no longer exists
        return null;
      }
    } catch (e) {
      console.error('Failed to calculate range while adding highlight. Post id:', post.id);
      console.error(e);
      return null;
    }

    const marks = addDOMHighlight(range, color);
    const highlightData = { marks, post, type, handlers: {} };
    this.highlights.set(id, highlightData);
  };

  public modifyHighlight = (id: string, type: HighlightType) => {
    const highlight = this.highlights.get(id);
    if (highlight) {
      const color = this.getColor(highlight.post.creator.color, type);
      modifyDOMHighlight(highlight.marks, 'backgroundColor', color);
      this.highlights.set(id, { ...highlight, type });
    } else {
      console.error('Attempted to modify nonexistent highlight. id: ' + id);
    }
  };

  public removeHighlight = (id: string) => {
    const highlight = this.highlights.get(id);
    if (highlight) {
      removeDOMHighlight(highlight.marks);
      this.highlights.delete(id);
    }
  };

  public addHighlightTemp = (range: Range, color: string = 'yellow', type: HighlightType) => {
    const id = 'temp';
    this.removeHighlight(id);

    color = this.getColor(color, type);
    const marks = addDOMHighlight(range, color);
    const highlightData = { color, marks, type };
    this.highlightTemp = highlightData;
  };

  public modifyHighlightTemp = (type: HighlightType, color?: string) => {
    if (this.highlightTemp) {
      if (!color) color = this.highlightTemp.color;
      color = this.getColor(color, type);
      modifyDOMHighlight(this.highlightTemp.marks!, 'backgroundColor', color);
      this.highlightTemp = { ...this.highlightTemp, type };
    }
  };

  public removeHighlightTemp = () => {
    if (this.highlightTemp) {
      removeDOMHighlight(this.highlightTemp.marks!);
      this.highlightTemp = null;
    }
  };

  private getColor = (colorStr: string, type: HighlightType): string => {
    const color = Color(colorStr);
    const rgba = (c: Color<string>, o: number) => `rgba(${c.red()},${c.green()},${c.blue()},${o})`;
    if (type === HighlightType.Default) return rgba(color, 0.25);
    return rgba(color, 0.65);
  };
}
