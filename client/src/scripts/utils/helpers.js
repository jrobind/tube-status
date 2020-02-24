import {store} from "./client-store.js";
const {getStore} = store;

/**
 * A DOM element creator utility which creates elements,
 * and sets specified attributes and event listeners.
 * @param {string} elType
 * @param {object=} options
 * @return {Element}
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

/**
 * Returns an array of keys representing table header values.
 * @param {string} type
 * @return {Array<string>}
 */
export const returnKeys = (type) => {
  const dayKey = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const hourKey = [
    "5",
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

/**
 * Attempts to find and return a line subscription data object
 * from the client store.
 * @param {string} line
 * @return {object}
 */
export const findLineSubscription = (line) => {
  const {lineSubscriptions} = getStore();
  const subData = lineSubscriptions.filter((sub) => sub.line === line);

  return subData.length ? subData[0] : {};
};

/**
 * Removes "_id" property from line subscription objects
 * @param {array} subs
 * @return {array}
 */
export const removeSubscriptionId = (subs) => {
  return subs.map((sub) => {
    delete sub._id;
    return sub;
  });
};

/**
 * Checks for and removes duplicate disruption reasons and status'.
 * @param {array} lines
 * @return {array}
 * @private
 */
export const removeDuplicate = (lines) => {
  return lines.reduce((unique, line) => {
    const hasDup = !!unique.filter((obj) => obj.status === line.status).length;

    if (!hasDup) unique.push(line);
    return unique;
  }, []).reduce((unique, line) => {
    const hasDup = !!unique.filter((obj) => obj.reason === line.reason).length;

    if (!hasDup) unique.push(line);
    return unique;
  }, []);
};
