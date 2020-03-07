import {store} from "./client-store.js";
const {getStore} = store;

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  FOCUS: "tube-status-focus",
};

/**
* CSS class selectors.
* @enum {string}
*/
const cssSelector = {
  FOCUSABLE_ELEMENTS: "button:not([disabled]), [tabindex]",
};

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

  if (!Object.keys(options).length) return el;

  // set attributes
  classname && el.classList.add(classname);
  id && el.setAttribute("id", id);

  if (Array.isArray(data)) {
    data.forEach(({name, value}) => el.setAttribute(name, value));
  } else {
    el.setAttribute(data.name, data.value);
  }

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

/**
 * Removes class that prevents tab focus on given element
 * @param {HTMLElement} el
 */
export const handleTabFocus = (el) => {
  const els = document.querySelectorAll(`.${cssClass.FOCUS}`);

  els.forEach((el) => el.classList.remove(cssClass.FOCUS));

  if (el instanceof HTMLElement) {
    el.classList.add(cssClass.FOCUS);
  } else {
    el.target.classList.add(cssClass.FOCUS);
  }
};

/**
 * Creates a focus trap within the modal component
 * @param {HTMLElement} el
 */
export const createFocusTrap = (el) => {
  const focusableEls = el.querySelectorAll(cssSelector.FOCUSABLE_ELEMENTS);
  const firstFocusableEl = focusableEls[0];
  const lastFocusableEl = focusableEls[focusableEls.length - 1];

  el.addEventListener("keydown", function(e) {
    if (e.which === 9) {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusableEl) {
          firstFocusableEl.focus();
          e.preventDefault();
        }
      }
    }
  });
};
