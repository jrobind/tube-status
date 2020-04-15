import {store} from "../utils/client-store.js";
import {customEvents} from "../constants.js";
import {handleTabFocus} from "../utils/helpers.js";
import {actions} from "../constants.js";
const {subscribeToStore, getStore} = store;

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  TOGGLE_ICONS: ".tube-status__filter-toggle .material-icons",
  TOGGLE: ".tube-status__filter-toggle",
};

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  FILTER_ACTIVE: "tube-status-filter--active",
  TOGGLE_ON: "tube-status__filter-toggle--on",
  TOGGLE_OFF: "tube-status__filter-toggle--off",
  HIDE: "tube-status-hide",
};

/**
 * Filter custom element.
 */
export default class Filter extends HTMLElement {
  /**
   * Create loading custom element.
   */
  constructor() {
    super();

    /** @private {boolean} */
    this.filter_ = false;

    /**
     * @type {NodeList}
     * @private
     */
    this.toggleIconEls_ = this.querySelectorAll(cssSelector.TOGGLE_ICONS);

    /**
     * @type {HTMLElement}
     * @private
     */
    this.filterToggle_ = this.querySelector(cssSelector.TOGGLE);
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    subscribeToStore([
      {
        callback: this.toggleDisplay_.bind(this),
        action: actions.AUTHENTICATION,
      },
      {
        callback: this.emit_.bind(this, "reset"),
        action: actions.RESET_APP,
      },
    ]);

    // listeners
    this.toggleIconEls_.forEach((el) => {
      el.addEventListener("click", this.handleClick_.bind(this));
    });
    this.addEventListener("keyup", this.handleKeyup_.bind(this));
    this.addEventListener("keypress", this.handleKeyPress_);
    document.addEventListener(
      customEvents.READY, this.toggleDisplay_.bind(this));
  }

  /**
   * Handler for a tab keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyup_(e) {
    e.which === 9 && handleTabFocus(this.filterToggle_);
  }

  /**
   * Handler for a enter keypress event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyPress_(e) {
    if (e.which === 13) {
      this.emit_();
      this.toggleIcon_();
    }
  }

  /**
   * Handler for a click event.
   * @param {Event} e
   * @private
   */
  handleClick_(e) {
    this.emit_();
    this.toggleIcon_();
  }

  /**
   * Toggles the visibility of the filter component
   * @private
   */
  toggleDisplay_() {
    const {userProfile: {signedIn}} = getStore();

    signedIn ?
      this.classList.add(cssClass.FILTER_ACTIVE) :
      this.classList.remove(cssClass.FILTER_ACTIVE);
  }

  /**
   * Emits a custom event to be consumed by the Tube status wrapper element.
   * @param {string=} reset
   * @private
   */
  emit_(reset) {
    this.filter_ = reset ? false : !this.filter_;

    const detail = {detail: {filter: this.filter_}};

    document.dispatchEvent(
      new CustomEvent(customEvents.FILTER_SUBSCRIPTIONS, detail));
  }

  /**
   * Updates the filter toggle icon.
   * @private
   */
  toggleIcon_() {
    this.toggleIconEls_.forEach((el) => {
      if (el.classList.contains(cssClass.HIDE)) {
        el.classList.remove(cssClass.HIDE);
      } else {
        el.classList.add(cssClass.HIDE);
      }
    });
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.handleClick_);
    this.removeEventListener("keyup", this.handleKeyup_);
    this.removeEventListener("keypress", this.handleKeyPress_);
  }
}
