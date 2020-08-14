/**
 * Get width of vertical scrollbar.
 * TODO: Can prob be faster, memoize per page.
 */
export function getScrollbarDx() {
  const html = document.querySelector('html');
  if (html) return window.innerWidth - html.offsetWidth;

  // Fallback method: append hidden element, force scrollbar, and calc width
  const scrollDiv = document.createElement('div');
  const styles = {
    width: '100px',
    height: '100px',
    overflow: 'scroll',
    position: 'absolute',
    top: '-9999px'
  };
  Object.assign(scrollDiv.style, styles);
  document.body.appendChild(scrollDiv);

  // Calc width and remove element
  const scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
  return scrollbarWidth;
}
