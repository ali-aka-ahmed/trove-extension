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

  public addNewPostHighlight = (
    ranges: RangyRangeEx | RangyRangeEx[],
    color: string='yellow'
  ) => {
    const new1 = this.highlights.get(HighlightClass.NewPost1);
    if (!new1) {
      this.addHighlight(ranges, HighlightClass.NewPost1, color);
      this.removeHighlight(HighlightClass.NewPost2);
    } else {
      this.addHighlight(ranges, HighlightClass.NewPost2, color);
      this.removeHighlight(HighlightClass.NewPost1);
    }
  }

  public removeNewPostHighlight = () => {
    this.removeHighlight(HighlightClass.NewPost1);
    this.removeHighlight(HighlightClass.NewPost2);
  }

  public addHighlight = (
    ranges: RangyRangeEx | RangyRangeEx[], 
    className: string, 
    color: string='yellow'
  ) => {
    try {
      // this.removeHighlight(className);
      const applier = createClassApplier(className, {
        elementProperties: { 
          style: { 'background-color': color }
        }
      });
      this.highlighter.addClassApplier(applier);
      const highlights = this.highlighter.highlightRanges(className, toArray(ranges), { exclusive: false });
      this.highlights.set(className, highlights);
    } catch (err) {
      console.error(err);
    }
  }

  public removeHighlight = (className: string) => {
    try {
      const highlights = this.highlights.get(className);
      if (!highlights) return;
      this.highlighter.removeHighlights(highlights);
      this.highlights.delete(className);
    } catch (err) {
      console.error(err);
    }
  }
}

/**
 * Ids of different types of highlights. Making the assumption we can only have one instance of 
 * each type visible simultaneously.
 */
export enum HighlightClass {
  HoverPost = 'TbdHighlight--Hover',
  NewPost   = 'TbdHighlight--New',
  NewPost1  = 'TbdHighlight--New1',
  NewPost2  = 'TbdHighlight--New2',
  Post      = 'TbdHighlight',
}
