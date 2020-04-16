import {store} from "../utils/client-store.js";
import {actions, delayTypes, customEvents, copy} from "../constants.js";
import {apiUnsubscribe} from "../utils/api.js";
import Tooltip from "./tooltip.js";
import {
  removeDuplicate,
  handleTabFocus,
  findLineSubscription,
  removeSubscriptionId,
} from "../utils/helpers.js";
const {subscribeToStore, getStore, updateStore} = store;

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  TOGGLE_ON: ".tube-status__filter-toggle--on",
  TOOLTIP: ".tube-status-tooltip",
  SUB_ICON_WRAPPER: ".tube-line-sub__image-wrapper",
  TOAST: ".tube-status-toast",
};

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  STATUS_WRAPPER: "tube-status-wrapper",
  SUB_STATUS: "tube-line-sub__status",
  SUB_ICON: "tube-line-sub__image-sub",
  ICON_IMAGE: "tube-line-sub__image",
  UNSUB_ICON: "tube-line-sub__image-unsub",
  SUB_ICON_WRAPPER: "tube-line-sub__image-wrapper",
  LINE_SUB: "tube-line-sub",
  INFO_REASON_TITLE: "tube-line-info__reason-title",
  ACTIVE: "tube-line--active",
  HIDDEN: "tube-status-hide",
};

/** @const {number} */
const LOADING_DELAY = 500;

/**
 * Tube line custom element.
 */
export default class TubeLine extends HTMLElement {
  /** Create tube line custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.line_ = this.getAttribute("line");

    /** @private {boolean} */
    this.touched_ = false;

    /** @private {HTMLElement} */
    this.tubeStatusWrapper_;

    /** @private {HTMLElement} */
    this.subStatusEl_ = this.querySelector(`.${cssClass.SUB_STATUS}`);

    /** @private {HTMLElement} */
    this.subIconWrapper_ = this.querySelector(cssSelector.SUB_ICON_WRAPPER);

    /** @private {HTMLImageElement} */
    this.subIconEl_ = this.querySelector(`.${cssClass.SUB_ICON}`);

    /** @private {HTMLImageElement} */
    this.iconImageEl_ = this.querySelector(`.${cssClass.ICON_IMAGE}`);

    /** @private {HTMLImageElement} */
    this.unsSubIconEl_ = this.querySelector(`.${cssClass.UNSUB_ICON}`);

    /** @private {HTMLElement} */
    this.reasonTitleEl_ = this.querySelector(`.${cssClass.INFO_REASON_TITLE}`);

    /** @private {boolean} */
    this.connectedCalled_ = false;
  }


  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    if (this.connectedCalled_) return;

    subscribeToStore([
      {
        callback: this.updateTubeLineContent_.bind(this),
        action: actions.LINES,
      },
      {
        callback: this.toggleSubscriptionIcon_.bind(this),
        action: actions.LINE_SUBSCRIBE,
      },
      {
        callback: this.toggleSubscriptionIcon_.bind(this),
        action: actions.LINE_UNSUBSCRIBE,
      },
      {
        callback: this.toggleSubscriptionIcon_.bind(this),
        action: actions.RESET_APP,
      },
      {
        callback: this.hideSubscritpionIcons_.bind(this),
        action: actions.RESET_APP,
      },
    ]);

    // listeners
    this.addEventListener(
      "touchstart", this.handleTouch_.bind(this), {passive: true});
    this.addEventListener("click", this.handleClick_.bind(this));
    this.addEventListener("keyup", this.handleKeyup_.bind(this));
    this.addEventListener("keypress", this.handleKeyPress_.bind(this));
    this.subIconWrapper_.addEventListener(
      "keyup", this.handleKeyup_.bind(this));
    this.subIconWrapper_.addEventListener(
      "keypress", this.handleKeyPress_.bind(this));
    this.subIconWrapper_.addEventListener(
      "mouseover", this.toggleTooltip_.bind(this));
    this.subIconWrapper_.addEventListener(
      "mouseout", this.toggleTooltip_.bind(this));

    this.tubeStatusWrapper_ = document.querySelector(
      `.${cssClass.STATUS_WRAPPER}`);
    this.connectedCalled_ = true;
  }

  /**
   * Emits a custom event to be consumed by the Modal element.
   * @private
   */
  emit_() {
    const detail = {detail: {line: this.line_}};

    document.dispatchEvent(
      new CustomEvent(customEvents.SHOW_SUBSCRIBE, detail));
  }

  /**
   * Updates class property if user touched device.
   * @param {Event} e
   * @private
   */
  handleTouch_(e) {
    e.stopImmediatePropagation();

    this.touched_ = true;
  }

  /**
   * Handles a subscription icon click.
   * @private
   */
  handleSubClick_() {
    const {userProfile: {signedIn}} = getStore();

    if (this.subIconWrapper_.getAttribute("type") === "subscribe") {
      this.handleSubscribe_();
    } else {
      signedIn && this.handleUnSubscribeRequest_();
    }
  }

  /**
   * Handles the line subscription process.
   * @private
   */
  handleSubscribe_() {
    const {notificationsFeature, userProfile: {signedIn}} = getStore();

    if (!notificationsFeature) return;

    signedIn && this.emit_();
  }

  /**
   * Handles line unsubscribe requests.
   * @async
   * @private
   */
  async handleUnSubscribeRequest_() {
    const detail = {detail: {filter: true}};
    const {notificationsFeature} = getStore();
    const toggleOnEl = document.querySelector(cssSelector.TOGGLE_ON);
    const toastEl = /** @type {HTMLElement} */ (
      document.querySelector(cssSelector.TOAST));

    if (!notificationsFeature) return;

    updateStore({
      action: actions.LOADING_LINE,
      data: {loadingState: {state: true, line: this.line_}},
    });

    const result = await apiUnsubscribe(this.line_);
    const {subscription} = result;

    if (subscription) {
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY));

      updateStore({
        action: actions.LINE_UNSUBSCRIBE,
        data: {lineSubscriptions: removeSubscriptionId(subscription)},
      });
    } else {
      this.handleError_(result);
    }

    updateStore({
      action: actions.LOADING_LINE,
      data: {loadingState: {state: false, line: this.line_}},
    });

    // if we are within a filtered view, we should update the filter again
    if (!toggleOnEl.classList.contains(cssClass.HIDDEN)) {
      document.dispatchEvent(
        new CustomEvent(customEvents.FILTER_SUBSCRIPTIONS, detail));
    }

    toastEl.setAttribute("unsubscribe", "");
  }

  /**
   * Hides tube line subscription icons.
   * @private
   */
  hideSubscritpionIcons_() {
    this.subIconEl_.classList.add(cssClass.HIDDEN);
  }

  /**
   * Handler for a tab keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyup_(e) {
    e.stopImmediatePropagation();
    e.which === 9 && handleTabFocus(e.target);
  }

  /**
   * Handler for a enter keypress event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyPress_(e) {
    e.stopImmediatePropagation();
    e.which === 13 && this.handleClick_(e);
  }

  /**
   * Toggle subscribe/unsubscribe tooltip.
   * @param {Event} e
   * @private
   */
  toggleTooltip_(e) {
    if (this.touched_) return;

    const {notificationsFeature} = getStore();
    const styles = {top: "-18px", left: "50px"};
    const type = this.subIconWrapper_.getAttribute("type");
    let tooltipEl;

    if (e.type === "mouseout") {
      const tooltipEl = document.querySelector(cssSelector.TOOLTIP);

      tooltipEl.parentNode.removeChild(tooltipEl);
      return;
    }

    if (!notificationsFeature) {
      tooltipEl = new Tooltip(copy.TOOLTIP_MSG_NO_PUSH_SUPPORT, styles);
    } else {
      tooltipEl = type === "subscribe" ?
        new Tooltip(copy.TOOLTIP_MSG_SUBSCRIBE, styles) :
        new Tooltip(copy.TOOLTIP_MSG_UNSUBSCRIBE, styles);
    }

    this.subIconWrapper_.appendChild(tooltipEl);
  }

  /**
   * Dispatches custom click event to toggle app modal.
   * @param {Event} e
   * @private
   */
  handleClick_(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const detail = {detail: {line: this.line_}};
    const isActive = this.classList.contains(cssClass.ACTIVE);
    const isSubEl = target.classList.contains(cssClass.ICON_IMAGE) ||
      target.classList.contains(cssClass.SUB_ICON_WRAPPER);

    if (!isActive) return;

    if (isSubEl) {
      this.handleSubClick_(e);
      return;
    }

    document.dispatchEvent(
      new CustomEvent(customEvents.LINE_CLICK, detail));
  }

  /**
   * Updates DOM with every new line status.
   * @private
   */
  updateTubeLineContent_() {
    const {lineInformation} = getStore();
    const lineInfo = removeDuplicate(lineInformation[this.line_]);
    const {status, reason} = lineInfo[0];

    this.subStatusEl_.textContent = `${this.line_}`;
    this.reasonTitleEl_.textContent = "";

    this.setScoreAttribute_(status);

    // line should appear clickable if there are delays/disruptions
    reason ?
      this.classList.add(cssClass.ACTIVE) :
      this.classList.remove(cssClass.ACTIVE);

    lineInfo.forEach((info, i)=> {
      const {status} = info;
      const last = i === lineInfo.length -1;
      const pipe = last ? "" : " | ";

      this.reasonTitleEl_.textContent += ` ${status} ${pipe}`;
    });
  }

  /**
   * Toggles the tube line subscription icon state
   * @private
   */
  toggleSubscriptionIcon_() {
    if (Object.keys(findLineSubscription(this.line_)).length) {
      this.subIconEl_.classList.add(cssClass.HIDDEN);
      this.unsSubIconEl_.classList.remove(cssClass.HIDDEN);
      this.subIconWrapper_.setAttribute("type", "unsubscribe");
    } else {
      this.subIconEl_.classList.remove(cssClass.HIDDEN);
      this.unsSubIconEl_.classList.add(cssClass.HIDDEN);
      this.subIconWrapper_.setAttribute("type", "subscribe");
    }
  }

  /**
   * Updates tube line score attribute with every new line status.
   * @private
   * @param {string} status
   */
  setScoreAttribute_(status) {
    switch (status) {
    case delayTypes.NO_SERVICE:
      this.setAttribute("score", "6");
      break;
    case delayTypes.SERVICE_CLOSED:
      this.setAttribute("score", "6");
      break;
    case delayTypes.PART_CLOSURE:
      this.setAttribute("score", "5");
      break;
    case delayTypes.PLANNED_CLOSURE:
      this.setAttribute("score", "5");
      break;
    case delayTypes.PART_SUSPENDED:
      this.setAttribute("score", "4");
      break;
    case delayTypes.SEVERE_DELAYS:
      this.setAttribute("score", "3");
      break;
    case delayTypes.MINOR_DELAYS:
      this.setAttribute("score", "2");
      break;
    case delayTypes.SPECIAL_SERVICE:
      this.setAttribute("score", "2");
      break;
    case delayTypes.GOOD_SERVICE:
      this.setAttribute("score", "1");
      break;
    }
  }

  /**
   * Handles api fetch errors.
   * @param {object} e
   * @private
   */
  handleError_(e) {
    console.error(`Unable to subscribe to line at this time. ${e}`);
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick_);
    this.removeEventListener("keyup", this.handleKeyup_);
    this.removeEventListener("keypress", this.handleKeyPress_);
    this.subIconEl_.removeEventListener(
      "mouseover", this.toggleTooltip_.bind(this));
    this.subIconEl_.removeEventListener(
      "mouseout", this.toggleTooltip_.bind(this));
  }
}
