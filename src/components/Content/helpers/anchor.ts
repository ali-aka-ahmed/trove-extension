import Point from "./Point";

export const getAnchorPoint = (e: React.MouseEvent | MouseEvent) => {

}

export const parseAnchor = () => {

}

export const parseAnchorPoint = () => {

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
