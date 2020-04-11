import {create} from "../utils/helpers.js";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  TOOLTIP: "tube-status-tooltip",
  TOOLTIP_MESSAGE: "tube-status-tooltip__message",
};

/**
 * Tooltip custom element.
 */
export default class Tooltip extends HTMLElement {
  /**
   * Create Tooltip custom element.
   * @param {string} message
   * @param {object} styles
   */
  constructor(message, styles) {
    super();

    /** @private {string} */
    this.message_ = message;

    /** @private {object} */
    this.styles_ = styles;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    this.classList.add(cssClass.TOOLTIP);
    this.render_();
  }

  /**
   * Handles the rendering of Tooltip markup.
   */
  render_() {
    const messageEl = create("div", {
      classname: cssClass.TOOLTIP_MESSAGE,
      copy: this.message_,
    });

    for (const key in this.styles_) {
      if (Object.prototype.hasOwnProperty.call(this.styles_, key)) {
        this.style[key] = this.styles_[key];
      }
    }

    this.appendChild(messageEl);
  }
}
