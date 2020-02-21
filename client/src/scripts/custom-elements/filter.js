import {customEvents} from "../constants.js";

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  FILTER_IMAGE: ".tube-status-filter__image",
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
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    this.addEventListener("click", () => {
      this.emit_();
      this.toggleIcon_();
    });
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
    const filterImgEl = /** @type {HTMLImageElement} */ (
      this.querySelector(cssSelector.FILTER_IMAGE));

    filterImgEl.src = (this.filter_) ?
      FILTER_ON_IMG_PATH :
      FILTER_OFF_IMG_PATH;
  }
}
