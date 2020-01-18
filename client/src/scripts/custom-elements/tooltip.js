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
   * Create loading custom element.
   * @param {string} message
   */
  constructor(message) {
    super();

    /** @private {string} */
    this.message_ = message;
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

    this.appendChild(messageEl);
  }
}
