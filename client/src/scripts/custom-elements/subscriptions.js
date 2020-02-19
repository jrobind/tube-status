import {store} from "../utils/client-store.js";
import {create} from "../utils/helpers.js";
const {getStore} = store;

/** @const {string} */
const SUBSCRIPTIONS_COPY = "Current subscriptions";

/** @const {string} */
const NO_SUBSCRIPTIONS_COPY = "No subscriptions";

/** @const {string} */
const SUBSCRIPTION_IMG_PATH = "/images/subscriptions.svg";

/** @const {string} */
const SUBSCRIPTION_FILLED_IMG_PATH = "/images/subscriptions-filled.svg";

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
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  SUBSCRIPTION_IMG: ".tube-status-header__subscription-image",
};

/**
 * Subscriptions custom element.
 */
export default class Subscriptions extends HTMLElement {
  /** Create subscriptions custom element. */
  constructor() {
    super();

    /**
     * @private
     * @type {HTMLImageElement}
     */
    this.subIconEl_;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    this.addEventListener("click", this.toggleSubscriptions_.bind(this));
    this.subIconEl_ = this.querySelector(cssSelector.SUBSCRIPTION_IMG);
  }

  /**
   * Returns a boolean indicating the existance of the dropdown element.
   * @return {boolean}
   * @private
   */
  dropdownExists_() {
    return Array.from(this.children).some((child) => {
      return child.classList.contains(cssClass.SUBSCRIPTIONS);
    });
  }

  /**
   * Updates subscription icon src attribute.
   * @private
   */
  updateIcon_() {
    if (this.dropdownExists_()) {
      this.subIconEl_.src = SUBSCRIPTION_IMG_PATH;
    } else {
      this.subIconEl_.src = SUBSCRIPTION_FILLED_IMG_PATH;
    }
  }

  /**
   * Toggles the display of the line subscrptions dropdown.
   * @private
   */
  toggleSubscriptions_() {
    this.updateIcon_();

    if (this.dropdownExists_()) {
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
    this.removeContent_();

    const {lineSubscriptions} = getStore();
    const titleCopy = lineSubscriptions.length ?
      SUBSCRIPTIONS_COPY :
      NO_SUBSCRIPTIONS_COPY;
    const subWrapper = create("div", {classname: cssClass.SUBSCRIPTIONS});
    const title = create("h2", {
      classname: cssClass.SUBSCRIPTIONS_HEADING,
      copy: titleCopy,
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

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.toggleSubscriptions_);
  }
}
