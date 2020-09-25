import { Anchor, AnchorType } from '../../../../common';
import Point from "../Point";

export const parseAnchor = (anchor: Anchor) => {
  switch (anchor.type) {
    case AnchorType.Point:
      return parseAnchorPoint(anchor);
    case AnchorType.Text:
      return parseAnchorText(anchor);
  }
}

const parseAnchorText = (anchor: Anchor & { type: AnchorType.Text }) => {
}

const parseAnchorPoint = (anchor: Anchor & { type: AnchorType.Point }) => {
  const maxPos = new Point(getScrollWidth(), getScrollHeight());
  const scale = new Point(maxPos.x / anchor.bounds.x, maxPos.y / anchor.bounds.y);
  return new Point(anchor.location.x * scale.x, anchor.location.y * scale.y);
}

const getScrollTop = (): number => {
  return window.pageYOffset 
    || document.documentElement.scrollTop 
    || document.body.scrollTop 
    || 0;
}

const getScrollLeft = (): number => {
  return window.pageXOffset 
    || document.documentElement.scrollLeft 
    || document.body.scrollLeft 
    || 0;
}

const getScrollHeight = (): number => {
  return document.documentElement.scrollHeight || document.body.scrollHeight;
}

const getScrollWidth = (): number => {
  return document.documentElement.scrollWidth || document.body.scrollWidth;
}

const getAbsolutePosition = (relativePos: Point) => {
  return new Point(relativePos.x += getScrollLeft(), relativePos.y += getScrollTop());
}

const getRelativePosition = (absolutePos: Point) => {
  return new Point(absolutePos.x -= getScrollLeft(), absolutePos.y -= getScrollTop());
}
