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

export const isMouseBetweenRects = (e: MouseEvent, r1: DOMRect, r2: DOMRect): boolean => {
  if (r1.bottom > e.pageY || e.pageY > r2.top) return false;
  const ratio = (e.pageY - r1.bottom) / (r2.top - r1.bottom);
  const xL = ratio * (r1.left - r2.left) + r1.left;
  const xR = ratio * (r1.right - r2.right) + r2.right;
  return xL <= e.pageX && e.pageX <= xR;
};
