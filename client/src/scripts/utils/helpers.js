/**
 * A DOM element creator utility which creates elements,
 * and sets specified attributes and event listeners.
 * @param {string} elType
 * @param {object=} options
 * @return {Element} el
 */
export const create = (elType, options = {}) => {
  const el = document.createElement(elType);
  const {
    event = {},
    copy,
    id,
    data = {},
    classname,
  } = options;
  const {name, value} = data;
  const {type, fn} = event;

  if (!options) return el;

  // set options
  classname && el.classList.add(classname);
  id && el.setAttribute("id", id);
  Object.keys(data).length && el.setAttribute(name, value);
  Object.keys(event).length && el.addEventListener(type, fn);
  if (copy) el.innerText = copy;

  return el;
};
