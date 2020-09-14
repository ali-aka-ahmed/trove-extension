import Point from "./Point";

export type AnchorType = 'point' | 'div' | 'text';
export type Anchor = {
  type: 'point'
  location: Point,
  bounds: Point
};

export const getAnchor = (e: React.MouseEvent | MouseEvent): Anchor => {
  // Assume anchor is always a point for now
  const absPos = getAbsolutePosition(new Point(e.clientX, e.clientY));
  const maxPos = new Point(getScrollWidth(), getScrollHeight());
  return {
    type: 'point',
    location: absPos,
    bounds: maxPos
  };
}

export const parseAnchor = (anchor: Anchor): Point => {
  // Assume anchor is always a point for now
  const maxPos = new Point(getScrollWidth(), getScrollHeight());
  const scale = new Point(maxPos.x / anchor.bounds.x, maxPos.y / anchor.bounds.y);
  return new Point(anchor.location.x * scale.x, anchor.location.y * scale.y);
}

export const getScrollTop = (): number => {
  return window.pageYOffset 
    || document.documentElement.scrollTop 
    || document.body.scrollTop 
    || 0;
}

export const getScrollLeft = (): number => {
  return window.pageXOffset 
    || document.documentElement.scrollLeft 
    || document.body.scrollLeft 
    || 0;
}

export const getScrollHeight = (): number => {
  return document.documentElement.scrollHeight || document.body.scrollHeight;
}

export const getScrollWidth = (): number => {
  return document.documentElement.scrollWidth || document.body.scrollWidth;
}

export const getAbsolutePosition = (relativePos: Point) => {
  return new Point(relativePos.x += getScrollLeft(), relativePos.y += getScrollTop());
}
