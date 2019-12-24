import {store} from "../utils/client-store.js";
import {actions, delayTypes, customEvents} from "../constants.js";
const {subscribeToStore, getStore} = store;

/**
 * Tube line custom element.
 */
export default class Week extends HTMLElement {
  /** Create tube line custom element. */
  constructor() {
    super();

    /** @private {array} */
    this.days_;
  }

  /** Called every time element is inserted to DOM. */
  connectedCallback() {
    this.render_();
  }

  /**
   * Dispatches custom event to app modal containing week days
   * required for line subscriptions.
   * @param {Event} e
   * @private
   */
  handleClick_(e) {
    const detail = {detail: {line: this.days_}};

    document.dispatchEvent(
      new CustomEvent(customEvents.DAYS, detail));
  }

  /**
   * Renders markup enabling selection of week
   * days for line subscription.
   * @private
   */
  render_() {

  }
}
