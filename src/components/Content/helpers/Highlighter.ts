import { createClassApplier } from "@rangy/classapplier";
import { RangyRangeEx } from "@rangy/core";
import { Highlighter as RangyHighlighter } from "@rangy/highlighter";
import { toArray } from "../../../utils/general";

/**
 * Wrapper on top of Rangy Highlighter.
 */
export default class Highlighter {
  private highlighter: RangyHighlighter;
  private highlights: Map<string, any[]>;

  public constructor() {
    this.highlighter = new RangyHighlighter();
    this.highlights = new Map<string, any[]>();
  }

  public addHighlight = (
    ranges: RangyRangeEx | RangyRangeEx[], 
    className: string, 
    color: string='yellow'
  ) => {
    this.removeHighlight(className);
    const applier = createClassApplier(className, {
      elementProperties: { 
        style: { 'background-color': color }
      }
    });
    this.highlighter.addClassApplier(applier);
    const highlights = this.highlighter.highlightRanges(className, toArray(ranges));
    this.highlights.set(className, highlights);
  }

  public removeHighlight = (className: string) => {
    const highlights = this.highlights.get(className);
    if (!highlights) return;
    this.highlighter.removeHighlights(highlights);
    this.highlights.delete(className);
  }
}

/**
 * Ids of different types of highlights. Making the assumption we can only have one instance of 
 * each type visible simultaneously.
 */
export enum HighlightClass {
  HoverPost = 'TbdHighlight--Hover',
  NewPost   = 'TbdHighlight--New',
  Post      = 'TbdHighlight',
}
