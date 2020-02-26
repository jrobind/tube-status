import {store} from "../utils/client-store.js";
import {customEvents} from "../constants.js";
import {actions} from "../constants.js";
const {subscribeToStore, getStore} = store;

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  FILTER_IMAGE: ".tube-status-filter__image",
};

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  FILTER_ACTIVE: "tube-status-filter--active",
};

/** @const {string} */
const FILTER_ON_IMG_PATH = "/images/toggle-on.svg";

/** @const {string} */
const FILTER_OFF_IMG_PATH = "/images/toggle-off.svg";

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
     * @type {HTMLImageElement}
     * @private
     */
    this.filterImgEl_ = this.querySelector(cssSelector.FILTER_IMAGE);
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    subscribeToStore({
      callback: this.toggleDisplay_.bind(this),
      action: actions.AUTHENTICATION,
    });

    this.filterImgEl_.addEventListener("click", () => {
      this.emit_();
      this.toggleIcon_();
    });
    document.addEventListener(
      customEvents.READY, this.toggleDisplay_.bind(this));
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
   * @private
   */
  emit_() {
    this.filter_ = !this.filter_;

    const detail = {detail: {filter: this.filter_}};

    document.dispatchEvent(
      new CustomEvent(customEvents.FILTER_SUBSCRIPTIONS, detail));
  }

  /**
   * Updates the filter toggle icon.
   * @private
   */
  toggleIcon_() {
    this.filterImgEl_.src = (this.filter_) ?
      FILTER_ON_IMG_PATH :
      FILTER_OFF_IMG_PATH;
  }
}
