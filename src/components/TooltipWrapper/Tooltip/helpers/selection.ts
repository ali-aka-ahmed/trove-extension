export const selectionExists = (selection: Selection | null) => {
  return (
    !!selection &&
    selection.rangeCount > 0 &&
    !selection.isCollapsed &&
    selection.toString().length > 0 &&
    !selection.toString().match(/^\n+$/i)
  );
};

export const getHoveredRect = (e: MouseEvent, rects: DOMRectList | null) => {
  if (rects) {
    for (let i = 0; i < rects.length; i++) {
      if (isMouseInRect(e, rects[i])) {
        return rects[i];
      }
    }
  }

  return null;
};

export const isMouseInRect = (e: MouseEvent, rect: DOMRect): boolean => {
  return (
    e.pageX >= rect.left && e.pageX <= rect.right && e.pageY >= rect.top && e.pageY <= rect.bottom
  );
};

/**
 * Computes the if the mouse is contained within the quadrilateral defined by the bottom corners
 * of both given rects.
 * @param e
 * @param r1 The higher rect on the page
 * @param r2 The lower rect on the page
 */
export const isMouseBetweenRects = (e: MouseEvent, r1: DOMRect, r2: DOMRect): boolean => {
  if (r1.bottom > e.pageY || e.pageY > r2.bottom) return false;
  const ratio = (e.pageY - r1.bottom) / (r2.bottom - r1.bottom);
  const xL = r1.left - ratio * (r1.left - r2.left);
  const xR = r1.right - ratio * (r1.right - r2.right);
  return xL <= e.pageX && e.pageX <= xR;
};
