import {store} from "../utils/client-store.js";
import {create, handleTabFocus} from "../utils/helpers.js";
import {actions, copy} from "../constants.js";
const {getStore, subscribeToStore} = store;

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
  SUBSCRIPTION_IMG: "tube-status-subscriptions__img",
  HIDE: "tube-status-hide",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  SUBCRIPTION_IMG_FILLED: ".tube-status-subscriptions__img-filled",
  SUBCRIPTION_IMG_DEFAULT: ".tube-status-subscriptions__img--default",
};

/**
 * Subscriptions custom element.
 */
export default class Subscriptions extends HTMLElement {
  /** Create subscriptions custom element. */
  constructor() {
    super();

    /** @private {HTMLImageElement} */
    this.subImgDefaultEl_ = this.querySelector(
      cssSelector.SUBCRIPTION_IMG_DEFAULT);

    /** @private {HTMLImageElement} */
    this.subImgFilledEl_ = this.querySelector(
      cssSelector.SUBCRIPTION_IMG_FILLED);
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
      {
        callback: this.removeContent_.bind(this),
        action: actions.RESET_APP,
      },
    ]);

    // listeners
    document.addEventListener("click", this.toggleSubscriptions_.bind(this));
    this.addEventListener("keyup", this.handleKeyup_.bind(this));
    this.addEventListener("keypress", this.handleKeyPress_.bind(this));
  }

  /**
   * Handler for a tab keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyup_(e) {
    e.which === 9 && handleTabFocus(this);
  }

  /**
   * Handler for a enter keypress event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyPress_(e) {
    e.which === 13 && this.toggleSubscriptions_(e);
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

    if (!exisitingNotificationEl && !lineSubscriptions.length) return;

    if (exisitingNotificationEl) {
      if (!lineSubscriptions.length) {
        this.removeChild(exisitingNotificationEl);
        return;
      }

      this.removeChild(exisitingNotificationEl);
    }

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
      this.subImgFilledEl_.classList.add(cssClass.HIDE);
      this.subImgDefaultEl_.classList.remove(cssClass.HIDE);
    } else {
      this.subImgDefaultEl_.classList.add(cssClass.HIDE);
      this.subImgFilledEl_.classList.remove(cssClass.HIDE);
    }
  }

  /**
   * Toggles the display of the line subscrptions dropdown.
   * @param {Event} e
   * @private
   */
  toggleSubscriptions_(e) {
    const {userProfile: {signedIn}} = getStore();

    if (!signedIn) return;

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
      copy.SUBSCRIPTIONS :
      copy.SUBSCRIPTIONS_NONE;
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
    const {userProfile: {signedIn}} = store.getStore();

    const filteredChildren = Array.from(this.children).filter((child) => {
      const isImg = child.classList.contains(cssClass.SUBSCRIPTION_IMG);
      const isNotification = child.classList.contains(
        cssClass.SUBSCRIPTIONS_NOTIFICATION);
      const condition = signedIn ? (!isImg && !isNotification) : !isImg;

      if (condition) return child;
    });

    filteredChildren.forEach((child) => this.removeChild(child));
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.toggleSubscriptions_);
    this.removeEventListener("keyup", this.handleKeyup_);
    this.removeEventListener("keypress", this.handleKeyPress_);
  }
}
