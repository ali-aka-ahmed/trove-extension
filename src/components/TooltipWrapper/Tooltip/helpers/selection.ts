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
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  );
};

/**
 * Computes the if the mouse is contained within the polygon defined by the three furthest
 * corners on both given rectangles.
 * @param e
 * @param r1 The higher rect on the page
 * @param r2 The lower rect on the page
 */
export const isMouseBetweenRects = (e: MouseEvent, r1: DOMRect, r2: DOMRect): boolean => {
  // const x = e.
  if (
    e.clientY < r1.top ||
    e.clientY > r2.bottom ||
    e.clientX < Math.min(r1.left, r2.left) ||
    e.clientX > Math.max(r1.right, r2.right)
  ) {
    return false;
  }

  // Compute left bound
  let ratio: number;
  if (r1.left > r2.left) {
    // Left edge is defined by top left corners of both rects
    ratio = (e.clientY - r1.top) / (r2.top - r1.top);
  } else {
    // Left edge is defined by bottom left corners of both rects
    ratio = (e.clientY - r1.bottom) / (r2.bottom - r1.bottom);
  }

  const xL = r1.left - ratio * (r1.left - r2.left);
  if (e.clientX < xL) return false;

  // Compute right bound
  if (r1.right <= r2.right) {
    // Right edge is defined by top right corners of both rects
    ratio = (e.clientY - r1.top) / (r2.top - r1.top);
  } else {
    // Right edge is defined by bottom right corners of both rects
    ratio = (e.clientY - r1.bottom) / (r2.bottom - r1.bottom);
  }

  const xR = r1.right - ratio * (r1.right - r2.right);
  return e.clientX <= xR;
};
