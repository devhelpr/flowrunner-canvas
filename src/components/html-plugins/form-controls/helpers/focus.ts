export const onFocus = event => {
  event.preventDefault();
  let elements = document.getElementsByClassName('canvas__html-elements');
  if (elements.length > 0) {
    elements[0].scrollLeft = 0;
    elements[0].scrollTop = 0;
  }

  elements = document.getElementsByClassName('canvas-controller__scroll-container');
  if (elements.length > 0) {
    elements[0].scrollLeft = 0;
    elements[0].scrollTop = 0;
  }
};
