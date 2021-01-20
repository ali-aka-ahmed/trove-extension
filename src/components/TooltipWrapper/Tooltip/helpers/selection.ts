import classifyPoint from 'robust-point-in-polygon';

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
  const polygon = [
    [r1.left, r1.bottom],
    [r1.right, r1.bottom],
    [r2.left, r2.top],
    [r2.right, r2.top],
  ];
  console.log(
    'classify point:',
    polygon,
    [e.pageX, e.pageY],
    classifyPoint(polygon, [e.pageX, e.pageY]),
  );
  return classifyPoint(polygon, [e.pageX, e.pageY]) !== 1;
};
