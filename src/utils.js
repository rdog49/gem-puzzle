export const createElement = ({ tagName, className, textContent, parent }) => {
  const element = document.createElement(tagName);
  element.classList.add(className);
  element.textContent = textContent;

  if (parent) {
    parent.appendChild(element);
  }

  return element;
};
