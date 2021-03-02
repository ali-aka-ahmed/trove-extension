import Color from 'color';
import Post, { isPost } from '../../../../../entities/Post';
import { addDOMHighlight, modifyDOMHighlight, removeDOMHighlight } from './domHighlight';
import { getRangeFromTextRange, TextRange } from './textRange';

type AnyHighlight = SavedHighlight | UnsavedHighlight;
type SavedHighlight = {
  marks: HTMLElement[];
  data: Post;
  type: HighlightType;
  handlers: { [event: string]: (e: MouseEvent) => void };
  isTemporary: false; // Is this highlight saved or not
};
type UnsavedHighlight = {
  marks: HTMLElement[];
  data: UnsavedHighlightData;
  type: HighlightType;
  handlers: { [event: string]: (e: MouseEvent) => void };
  isTemporary: true;
};

export interface UnsavedHighlightData {
  id: string;
  color: string;
  textRange: TextRange;
}

export enum HighlightType {
  Default,
  Active, // Click, hover, new post
}

export default class Highlighter {
  highlights: Map<string, AnyHighlight>; // Highlight id -> highlight data
  activeHighlightId: string;

  constructor() {
    this.highlights = new Map<string, AnyHighlight>();
    this.activeHighlightId = '';
  }

  public addHighlight = (
    data: Post | UnsavedHighlightData,
    type: HighlightType = HighlightType.Default,
  ) => {
    let id: string, userColor: string, textRange: TextRange, isTemporary: boolean;
    if (isPost(data)) {
      // Add saved highlight from server
      if (!data.highlight || !data.creator) {
        console.error('Tried to add highlight for post without required data. Post id:', data.id);
        return null;
      }

      id = data.highlight.id;
      userColor = data.creator.color;
      textRange = data.highlight.textRange;
      isTemporary = false;
    } else {
      // Add temporary highlight
      ({ id, textRange } = data);
      userColor = data.color = 'yellow';
      isTemporary = true;
    }

    // Remove highlight if it is already on the page since it is being replaced
    this.removeHighlight(id);

    // Calculate range
    const color = this.getColor(userColor, type);
    let range: Range | null;
    try {
      range = getRangeFromTextRange(textRange);
      getSelection()!.removeAllRanges();
      if (!range) {
        // TODO: Handle case where range no longer exists
        return null;
      }
    } catch (e) {
      console.error('Failed to calculate range while adding highlight. Post id:', data.id);
      console.error(e);
      return null;
    }

    // Add highlight to DOM
    try {
      const marks = addDOMHighlight(range, color);
      const highlightData = {
        marks,
        data,
        type,
        isTemporary,
        handlers: {},
      } as AnyHighlight;
      this.highlights.set(id, highlightData);

      // Handle new active highlight
      if (type === HighlightType.Active && this.activeHighlightId !== id) {
        this.modifyHighlight(this.activeHighlightId, HighlightType.Default);
        this.activeHighlightId = id;
      }

      return highlightData;
    } catch (e) {
      console.error(
        `Failed to add highlight to DOM. Post id: ${data.id}. URL: ${window.location.href}`,
        data.id,
      );
      console.error(e);
      return null;
    }
  };

  public getHighlight = (id: string) => {
    return this.highlights.get(id) || null;
  };

  public modifyHighlight = (id: string, type: HighlightType) => {
    if (!id) return;

    const highlight = this.highlights.get(id);
    if (highlight) {
      try {
        // Modify highlight in DOM
        const userColor = highlight.isTemporary
          ? highlight.data.color
          : highlight.data.creator.color;
        const color = this.getColor(userColor, type);
        modifyDOMHighlight(highlight.marks, 'backgroundColor', color);
        this.highlights.set(id, { ...highlight, type });

        if (type === HighlightType.Active && this.activeHighlightId !== id) {
          // Handle new active highlight
          this.modifyHighlight(this.activeHighlightId, HighlightType.Default);
          this.activeHighlightId = id;
        } else if (type === HighlightType.Default && this.activeHighlightId === id) {
          // Handle active highlight becoming inactive
          this.activeHighlightId = '';
        }
      } catch (e) {
        console.error('Failed to modify highlight in DOM.', e);
      }
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

    if (this.activeHighlightId === id) {
      this.activeHighlightId = '';
    }
  };

  public getAllUnsavedHighlights = (): UnsavedHighlight[] => {
    return Array.from(this.highlights.values()).filter(
      (highlight) => highlight.isTemporary,
    ) as UnsavedHighlight[];
  };

  public removeAllUnsavedHighlights = () => {
    this.getAllUnsavedHighlights().forEach((highlight) => this.removeHighlight(highlight.data.id));
  };

  private getColor = (colorStr: string, type: HighlightType): string => {
    const color = Color(colorStr);
    const rgba = (c: Color<string>, o: number) => `rgba(${c.red()},${c.green()},${c.blue()},${o})`;
    if (type === HighlightType.Default) return rgba(color, 0.35);
    return rgba(color, 0.65);
  };
}

export const transformUnsavedHighlightDataToCreateHighlightRequestData = (
  data: UnsavedHighlight[],
) => {
  return data.map((uh) => ({
    textRange: uh.data.textRange,
    url: window.location.href,
  }));
};

export const transformUnsavedHighlightDataToTextList = (data: UnsavedHighlight[]) => {
  return data.map((uh) => uh.data.textRange.text);
};

export const getIdFromAnyHighlightData = (data: Post | UnsavedHighlightData): string => {
  if (isPost(data)) {
    return data.highlight.id;
  } else {
    return data.id;
  }
};
