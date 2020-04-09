import {copy} from "../constants.js";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  TOAST_MESSAGE: "tube-status-toast__message",
  HIDE: "tube-status-hide",
};

/** @const {number} */
const TOAST_DELAY_ = 4000;

/**
 * Toast custom element.
 */
export default class Toast extends HTMLElement {
  /** Create toast custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.messageEl_ = this.querySelector(`.${cssClass.TOAST_MESSAGE}`);
  }

  /**
   * Returns an array containing the names of the attributes being observed.
   * @return {array}
   */
  static get observedAttributes() {
    return ["delete", "subscribe", "unsubscribe", "hide"];
  }

  /**
   * Callback is called when one of the element's attributes is changed
   * in some way.
   * @param{string} name
   * @param {string} oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
    case "delete":
      this.updateMessage_(copy.TOAST_DELETE);
      break;
    case "subscribe":
      this.updateMessage_(copy.TOAST_SUBSCRIBE);
      break;
    case "unsubscribe":
      this.updateMessage_(copy.TOAST_UNSUBSCRIBE);
      break;
    }
  }

  /**
   * Updates the toast message element.
   * @param {string} msg
   * @async
   */
  async updateMessage_(msg) {
    this.classList.remove(cssClass.HIDE);
    this.messageEl_.textContent = msg;

    await new Promise((resolve) => setTimeout(resolve, TOAST_DELAY_));
    this.classList.add(cssClass.HIDE);
  }
}
