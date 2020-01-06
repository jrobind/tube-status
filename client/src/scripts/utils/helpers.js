/**
 * A DOM element creator utility which creates elements,
 * and sets specified attributes and event listeners.
 * @param {object} options
 * @return {Element} el
 */
export const createEl = (options) => {
  const {
    elType,
    event = {},
    copy,
    attributes = {},
  } = options;
  const {classname, id, data = {}} = attributes;
  const {name, value} = data;
  const {eventType, func, context = window} = event;
  let el;

  el = document.createElement(elType);
  classname && el.classList.add(classname);
  id && el.setAttribute("id", id);
  data && el.setAttribute(name, value);
  event && el.addEventListener(eventType, func.bind(context));
  if (copy) el.innerText = copy;

  return el;
};
