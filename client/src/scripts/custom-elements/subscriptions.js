import {store} from "../utils/client-store.js";
import {create, handleTabFocus} from "../utils/helpers.js";
import {actions} from "../constants.js";
const {getStore, subscribeToStore} = store;

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
  SUBSCRIPTIONS_NOTIFICATION: "tube-status-subscriptions__notifcation",
  SUBCRIPTION_IMAGE: "tube-status-header__subscription-image",
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
    subscribeToStore([
      {
        callback: this.renderNotificationIcon_.bind(this),
        action: actions.LINE_SUBSCRIBE,
      },
      {
        callback: this.renderNotificationIcon_.bind(this),
        action: actions.LINE_UNSUBSCRIBE,
      },
    ]);

    document.addEventListener("click", this.toggleSubscriptions_.bind(this));
    this.addEventListener("keyup", (e) => {
      e.which === 9 && handleTabFocus(this);
    });
    this.addEventListener("keypress", (e) => {
      e.which === 13 && this.toggleSubscriptions_(e);
    });

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
   * Renders a notification icon displaying the number of line subscriptions.
   * @private
   */
  renderNotificationIcon_() {
    const {lineSubscriptions} = getStore();
    const exisitingNotificationEl = /** @type {HTMLElement} */ (
      this.querySelector(`.${cssClass.SUBSCRIPTIONS_NOTIFICATION}`));

    if (!lineSubscriptions.length) return;

    if (exisitingNotificationEl) this.removeChild(exisitingNotificationEl);

    const notificationEl = create("div", {
      classname: cssClass.SUBSCRIPTIONS_NOTIFICATION,
      copy: lineSubscriptions.length,
    });

    this.appendChild(notificationEl);
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
   * @param {Event} e
   * @private
   */
  toggleSubscriptions_(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const which = /** @type {number} */ (e.which);
    const clickOutOfBounds = target.parentNode !== this;
    const enterKey = which === 13;

    if (clickOutOfBounds && !enterKey) {
      if (this.dropdownExists_()) {
        this.updateIcon_();
        this.removeContent_();
      }
    } else {
      this.updateIcon_();
      if (this.dropdownExists_()) {
        this.removeContent_();
      } else {
        this.renderSubscriptionList_();
      }
    }
  }

  /**
   * Renders markup showing list of currently subscribed lines.
   * @private
   */
  renderSubscriptionList_() {
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
    const filteredChildren = Array.from(this.children).filter((child) => {
      const isImg = child.classList.contains(cssClass.SUBCRIPTION_IMAGE);
      const isNotification = child.classList.contains(
        cssClass.SUBSCRIPTIONS_NOTIFICATION);

      if (!isImg && !isNotification) return child;
    });

    filteredChildren.forEach((child) => this.removeChild(child));
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.toggleSubscriptions_);
  }
}
