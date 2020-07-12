import copy from "../privacy-copy.js";
import Modal from "../custom-elements/modal.js";
import {customEvents} from "../constants.js";
import {
  create,
  createFocusTrap,
  handleTabFocus,
  handleModalScroll,
} from "../utils/helpers.js";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  MODAL_ACTIVE: "tube-status-modal--active",
  MODAL_ICON: "tube-status-modal__icon",
  MODAL_CAPTION: "tube-status-modal__caption",
  PRIVACY_BLOCK: "tube-status-modal-privacy__block",
  PRIVACY_BLOCK_HEADING: "tube-status-modal-privacy__heading",
  PRIVACY_BLOCK_CONTENT: "tube-status-modal-privacy__content",
  PRIVACY_TYPE: "tube-status-privacy-modal__type",
  OVERLAY_DIM: "dim",
  HIDE: "tube-status-hide",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  OVERLAY: ".overlay",
};

/**
 * PrivacyModal custom element.
 */
export default class PrivacyModal extends HTMLElement {
  /** Create modal custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.overlay_;

    /** @private {string} */
    this.typeEl_ = this.querySelector(`.${cssClass.PRIVACY_TYPE}`);
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    this.overlay_ = document.querySelector(cssSelector.OVERLAY);

    // listeners
    this.addEventListener("click", this.toggleModal_.bind(this));
    this.addEventListener("keyup", this.handleKeyup_.bind(this));
    this.addEventListener("keypress", this.handleKeyPress_.bind(this));
    document.addEventListener(
      customEvents.PRIVACY_POLICY, this.toggleModal_.bind(this));
  }

  /**
   * Handler for a keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyup_(e) {
    e.stopImmediatePropagation();
    e.which === 9 || e.which === 27 && handleTabFocus(this);
  }

  /**
   * Handler for a enter keypress event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyPress_(e) {
    e.stopImmediatePropagation();
    e.which === 13 && this.toggleModal_(e);
  }

  /**
   * Populates the modal with markup for privacy consent
   * or generic privacy copy.
   * @private
   */
  populateModal_() {
    this.appendChild(Modal.createModalIcon(this.toggleModal_.bind(this)));
    const captionEl = create("div", {classname: cssClass.MODAL_CAPTION});

    Object.entries(copy.DEFAULT).forEach((section) => {
      const {TITLE, CONTENT} = section[1];

      const blockEL = create("div", {classname: cssClass.PRIVACY_BLOCK});
      const headingEl = create("h2", {
        classname: cssClass.PRIVACY_BLOCK_HEADING,
        copy: TITLE,
      });
      const contentEl = create("p", {
        classname: cssClass.PRIVACY_BLOCK_CONTENT,
        copy: CONTENT,
      });

      blockEL.appendChild(headingEl);
      blockEL.appendChild(contentEl);
      captionEl.appendChild(blockEL);
    });

    this.appendChild(captionEl);
  }

  /**
   * Updates the URL when the privacy modal is displayed or closed
   * @param {string=} mode
   * @private
   */
  updateURL_(mode) {
    mode === "set" ?
      window.history.pushState(null, null, "/privacy") :
      window.history.pushState(null, null, "/");
  }

  /**
   * Handles closing of the privacy modal
   * @param {Event} e
   * @private
   */
  toggleModal_(e) {
    e.stopImmediatePropagation();

    const which = e ? e.which : null;
    const target = e.target;
    const modalIcon = this.querySelector(`.${cssClass.MODAL_ICON}`);

    if (e.type === "click" && modalIcon && target !== modalIcon) return;

    if (which === 9 && modalIcon) {
      handleTabFocus(modalIcon);
      return;
    }

    this.removeContent_();

    if (!modalIcon) {
      this.updateURL_("set");
      this.overlay_.classList.add(cssClass.OVERLAY_DIM);
      this.classList.add(cssClass.MODAL_ACTIVE);
      this.typeEl_.classList.add(cssClass.HIDE);
      this.populateModal_();

      createFocusTrap(this);
      handleModalScroll();
    } else {
      this.overlay_.classList.remove(cssClass.OVERLAY_DIM);
      this.classList.remove(cssClass.MODAL_ACTIVE);
      this.typeEl_.classList.remove(cssClass.HIDE);
      this.updateURL_();

      document.dispatchEvent(
        new CustomEvent(customEvents.MODAL_CLOSE));
      handleModalScroll();
    }
  }

  /**
   * Removes existing markup from Modal.
   * @private
   */
  removeContent_() {
    const children = Array.from(this.children);

    children.forEach((el) => {
      if (!el.classList.contains(cssClass.PRIVACY_TYPE)) {
        this.removeChild(el);
      }
    });
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener("click", this.toggleModal_);
    document.removeEventListener(
      customEvents.PRIVACY_POLICY, this.toggleModal_);
  }
}
