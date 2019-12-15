import {store} from "../utils/client-store.js";
import {customEvents, actions} from "../constants.js";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  MODAL_ACTIVE: "tube-status-modal--active",
  MODAL_CAPTION: "tube-status-modal__caption",
  MODAL_ICON: "tube-status-modal__icon",
  OVERLAY_DIM: "dim",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  OVERLAY: ".overlay",
};

/**
 * Modal custom element.
 */
export default class Modal extends HTMLElement {
  /** Create modal custom element. */
  constructor() {
    super();

    this.overlay_;
  }

  /** Called every time element is inserted to DOM. */
  connectedCallback() {
    this.overlay_ = document.querySelector(cssSelector.OVERLAY);
    // setup click event listener
    document.addEventListener(
      customEvents.LINE_CLICK, this.toggleModal_.bind(this));
  }

  /**
   * Gets the relevant line information from client store.
   * @private
   * @param {string} line
   */
  populateModal_(line) {
    const {reason} = store.getStore().lineInformation[line];
    const context = document.createElement("div");

    context.classList.add(cssClass.MODAL_CAPTION);
    context.textContent = reason;

    this.render_(context);
  }

  /**
   * Shows modal with line information releavnt to clicked line.
   * @param {CustomEvent} e
   * @private
   */
  toggleModal_(e) {
    const {line} = e.detail;

    if (line) {
      this.overlay_.classList.add(cssClass.OVERLAY_DIM);
      this.classList.add(cssClass.MODAL_ACTIVE);
      this.populateModal_(line);
    } else {
      this.overlay_.classList.remove(cssClass.OVERLAY_DIM);
      this.classList.remove(cssClass.MODAL_ACTIVE);
    }
  }

  /**
   * Renders inner modal content depending on use case.
   * @param {Element} context
   * @private
   */
  render_(context) {
    const captionEl = this.querySelector(`.${cssClass.MODAL_CAPTION}`);
    const modalIcon = document.createElement("div");

    modalIcon.classList.add(cssClass.MODAL_ICON);
    modalIcon.addEventListener("click", this.toggleModal_.bind(this));

    if (captionEl) {
      const contextEl = this.querySelector(`.${cssClass.MODAL_CAPTION}`);
      const modalIconEl = this.querySelector(`.${cssClass.MODAL_ICON}`);

      // remove existing markup before appending new context
      this.removeContent_({
        parent: this,
        children: [contextEl, modalIconEl],
      });
      this.appendChild(modalIcon);
      this.appendChild(context);
    } else {
      this.appendChild(modalIcon);
      this.appendChild(context);
    }
  }

  /**
   * Removes existing markup from Modal.
   * @param {object} elements
   * @private
   */
  removeContent_(elements) {
    const {parent, children} = elements;

    children.forEach((el) => parent.removeChild(el));
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener(actions.LINE_CLICK, this.toggleModal_);
  }
}
