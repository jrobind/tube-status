import {store} from "../utils/client-store.js";
import {actions} from "../constants.js";
import {create} from "../utils/helpers.js";
const {getStore} = store;

/** @const {string} */
const SUBSCRIPTIONS_HEADING = "Current subscriptions";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  SUBSCRIPTIONS: "tube-status-subscriptions__dropdown",
  SUBSCRIPTIONS_HEADING: "tube-status-subscriptions__heading",
  SUBSCRIPTION_LINE: "tube-status-subscriptions__line",
  SUBSCRIPTION_LINE_NAME: "tube-status-subscriptions__line-name",
  SUBSCRIPTION_LINE_COLOR: "tube-status-subscriptions__line-color",
};

/**
 * Subscriptions custom element.
 */
export default class Subscriptions extends HTMLElement {
  /** Create subscriptions custom element. */
  constructor() {
    super();
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    this.addEventListener("click", this.toggleSubscriptions_.bind(this));
  }

  /**
   * Toggles the display of the line subscrptions dropdown.
   * @private
   */
  toggleSubscriptions_() {
    const dropdownExists = Array.from(this.children).some((child) => {
      return child.classList.contains(cssClass.SUBSCRIPTIONS);
    });

    if (dropdownExists) {
      this.removeContent_();
    } else {
      this.render_();
    }
  }

  /**
   * Renders markup showing list of currently subscribed lines.
   * @private
   */
  render_() {
    const {lineSubscriptions} = getStore();
    const subWrapper = create("div", {classname: cssClass.SUBSCRIPTIONS});
    const title = create("h2", {
      classname: cssClass.SUBSCRIPTIONS_HEADING,
      copy: SUBSCRIPTIONS_HEADING,
    });

    subWrapper.appendChild(title);

    lineSubscriptions.forEach((sub) => {
      const subLine = create("div", {classname: cssClass.SUBSCRIPTION_LINE});
      const lineName = create("span", {
        classname: cssClass.SUBSCRIPTION_LINE_NAME,
        copy: sub.line,
      });
      const lineColor = create("span", {
        classname: `${cssClass.SUBSCRIPTION_LINE_COLOR}-${sub.line}`});

      subLine.appendChild(lineName);
      subLine.appendChild(lineColor);
      subWrapper.appendChild(subLine);
    });

    this.appendChild(subWrapper);
  }

  /**
   * Removes existing markup from subscriptions dropdown.
   * @private
   */
  removeContent_() {
    const children = Array.from(this.childNodes);

    children.forEach(
      (child) => child.nodeName !== "IMG" && this.removeChild(child));
  }
}
