import {store} from "../utils/client-store.js";
import {apiLogout, apiUnsubscribe} from "../utils/api.js";
import {findLineSubscription, removeSubscriptionId} from "../utils/helpers.js";
import {handleTabFocus} from "../utils/helpers.js";
import {actions, customEvents} from "../constants.js";
import Tooltip from "./tooltip.js";
const {updateStore, subscribeToStore, getStore} = store;

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  AUTHENTICATION: "tube-status-authentication",
  HEADER_AUTHENTICATION: "tube-status-header__authentication",
  HIDDEN: "tube-status-hide",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  AUTHENTICATION_SUBSCRIBE_ICON: ".tube-line-sub__subscription-image",
  TOOLTIP: ".tube-status-tooltip",
  TOGGLE_ON: ".tube-status__filter-toggle--on",
};

/** @const {number} */
const LOADING_DELAY = 500;

/** @const {number} */
const LOADING_DELAY_LOGOUT = 300;

/** @const {string} */
const UNSUBSCRIBE_IMG_PATH = "/images/unsubscribe.svg";

/** @const {string} */
const SUBSCRIBE_IMG_PATH = "/images/subscribe.svg";

/** @const {string} */
const TOOLTIP_MESSAGE_SUBSCRIBE =
  "Subscribe to line for push notification status updates";

/** @const {string} */
const TOOLTIP_MESSAGE_UNSUBSCRIBE =
  "Unsubscribe from line push notification status updates";

/**
 * Authentication custom element.
 */
export default class Authentication extends HTMLElement {
  /** Create authentication custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.dest_ = this.getAttribute("dest");

    /** @private {string} */
    this.authPath_ = this.getAttribute("auth-path");

    /** @private {string} */
    this.line_ = this.parentElement.parentElement.getAttribute("line");

    /** @private {string} */
    this.token_ = localStorage.getItem("JWT");

    /** @private {HTMLElement} */
    this.toggleOnEl_;

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
        callback: this.attemptAttrUpdate_.bind(this),
        action: actions.LINE_SUBSCRIBE,
      },
      {
        callback: this.attemptAttrUpdate_.bind(this),
        action: actions.LINE_UNSUBSCRIBE,
      },
      {
        callback: this.attemptAttrUpdate_.bind(this),
        action: actions.RESET_APP,
      },
    ]);

    this.classList.add(cssClass.AUTHENTICATION);
    this.toggleOnEl_ = document.querySelector(cssSelector.TOGGLE_ON);

    // listeners
    this.addEventListener("keyup", this.handleKeyup_.bind(this));
    this.addEventListener("keypress", this.handleKeyPress_.bind(this));
    this.addEventListener("click", this.handleAuth_.bind(this));

    if (!this.classList.contains(cssClass.HEADER_AUTHENTICATION)) {
      this.addEventListener("mouseover", this.toggleTooltip_.bind(this));
      this.addEventListener("mouseout", this.toggleTooltip_.bind(this));
    }

    this.handleJWT_();
    this.render_();
    this.connectedCalled_ = true;
  }

  /**
   * Handler for a tab keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyup_(e) {
    e.stopImmediatePropagation();
    e.which === 9 && handleTabFocus(this);
  }

  /**
   * Handler for a enter keypress event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyPress_(e) {
    e.stopImmediatePropagation();
    e.which === 13 && this.handleAuth_(e);
  }

  /**
   * Toggle authentication tooltip.
   * @param {Event} e
   * @private
   */
  toggleTooltip_(e) {
    const styles = {top: "11px", left: "400px"};

    if (e.type === "mouseout") {
      const tooltipEl = document.querySelector(cssSelector.TOOLTIP);

      tooltipEl.parentNode.removeChild(tooltipEl);
      return;
    }

    const tooltipEl = this.authPath_ === "subscribe" ?
      new Tooltip(TOOLTIP_MESSAGE_SUBSCRIBE, styles) :
      new Tooltip(TOOLTIP_MESSAGE_UNSUBSCRIBE, styles);

    // render and and insert tooltip
    this.insertAdjacentElement("afterend", tooltipEl);
  }

  /**
   * Verify existence of JWT and parse if present.
   * @private
   */
  handleJWT_() {
    // if token exists, login was successful
    if (this.token_) {
      const {photos, id} = JSON.parse(window.atob(this.token_.split(".")[1]));

      updateStore({
        action: actions.AUTHENTICATION,
        data: {signedIn: true, avatar: photos[0].value, id},
      });
    }
  }

  /**
   * Attempts authentication path attribute updates after authentication
   * @private
   */
  attemptAttrUpdate_() {
    const {userProfile: {signedIn}} = getStore();
    const isHeaderAuth = this.classList.contains(
      cssClass.HEADER_AUTHENTICATION);

    if (signedIn && isHeaderAuth) {
      this.setAttribute("auth-path", "Sign out");
    } else {
      this.setAttribute("auth-path", "Sign in");
    }

    // check if line subscription exists for current line
    if (!isHeaderAuth) {
      Object.keys(findLineSubscription(this.line_)).length ?
        this.setAttribute("auth-path", "unsubscribe") :
        this.setAttribute("auth-path", "subscribe");
    }

    this.authPath_ = this.getAttribute("auth-path");
    this.render_();
  }

  /**
   * Handles Google authentication process.
   * @param {Event} e
   * @private
   */
  handleAuth_(e) {
    const {userProfile} = getStore();

    e.stopPropagation();

    switch (this.authPath_) {
    case "Sign in":
      window.location.href = this.dest_;
      break;
    case "Sign out":
      this.handleLogout_();
      break;
    case "subscribe":
      userProfile.signedIn ?
        this.emit_() :
        window.location.href = this.dest_;
      break;
    case "unsubscribe":
      userProfile.signedIn ?
        this.handleUnSubscribeRequest_() :
        window.location.href = this.dest_;
      break;
    }
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
   * Handles the user logout process.
   * @async
   * @private
   */
  async handleLogout_() {
    updateStore({
      action: actions.LOADING_HEADER,
      data: {loadingState: {state: true, line: null}},
    });

    const result = await apiLogout();

    if (result === 200) {
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_LOGOUT));

      localStorage.removeItem("JWT");
      updateStore({
        action: actions.AUTHENTICATION,
        data: {signedIn: false, avatar: null, id: null},
      });
      // set authentication text back to login
      this.authPath_ = "Sign in";
      this.render_();

      updateStore({
        action: actions.LOADING_HEADER,
        data: {loadingState: {state: false, line: null}},
      });

      updateStore({action: actions.RESET_APP});
      console.log(store.getStore())
    } else {
      this.handleError_(result);
    }
  }

  /**
   * Handles line unsubscribe requests.
   * @async
   * @private
   */
  async handleUnSubscribeRequest_() {
    const detail = {detail: {filter: true}};
    const toggleOnEl = document.querySelector(cssSelector.TOGGLE_ON);

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
  }

  /**
   * Renders authentication text and updates subscription icon src.
   * @private
   */
  render_() {
    if (this.classList.contains(cssClass.HEADER_AUTHENTICATION)) {
      this.innerHTML = this.authPath_;
    } else {
      const subIconEl = /** @type {HTMLImageElement} */ (this.querySelector(
        cssSelector.AUTHENTICATION_SUBSCRIBE_ICON));

      subIconEl.src = (this.authPath_ === "unsubscribe") ?
        UNSUBSCRIBE_IMG_PATH :
        SUBSCRIBE_IMG_PATH;
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
    this.removeEventListener("click", this.handleAuth_);
    this.removeEventListener("keyup", this.handleKeyup_);
    this.removeEventListener("keypress", this.handleKeyPress_);

    if (!this.classList.contains(cssClass.HEADER_AUTHENTICATION)) {
      this.removeEventListener("mouseover", this.toggleTooltip_.bind(this));
      this.removeEventListener("mouseout", this.toggleTooltip_.bind(this));
    }
  }
}
