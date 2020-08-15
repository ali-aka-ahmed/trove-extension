/**
 * Get width of vertical scrollbar.
 * TODO: Can prob be faster, memoize per page.
 */
export function getScrollbarDx() {
  const html = document.querySelector('html');
  if (html) return window.innerWidth - html.offsetWidth;

  // Check if scrollbar actually exists
  const overflow = document.body.scrollHeight > document.body.clientHeight;
  const computed = window.getComputedStyle(document.body, null);
  const exists = computed.overflow === 'visible'
    || computed.overflowY === 'visible'
    || (computed.overflow === 'auto' && overflow)
    || (computed.overflowY === 'auto' && overflow);
  if (!exists) return 0;

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
