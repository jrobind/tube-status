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
    copy,
    id,
    data = {},
    classname,
  } = options;
  const {name, value} = data;

  if (!options) return el;

  // set attributes
  classname && el.classList.add(classname);
  id && el.setAttribute("id", id);
  Object.keys(data).length && el.setAttribute(name, value);

  // set event listeners
  if (Array.isArray(options.event)) {
    options.event.forEach((ev) => el.addEventListener(ev.type, ev.fn));
  } else if (typeof options.event === "object") {
    const {type, fn} = options.event;

    el.addEventListener(type, fn);
  }
  // set copy
  if (copy) el.innerText = copy;

  return el;
};

export const returnKeys = (type) => {
  const dayKey = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const hourKey = [
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
  ];

  return type === "day" ? dayKey : hourKey;
};
