import {store} from "../utils/client-store.js";
import {apiSubscribe} from "../utils/api.js";
import copy from "../privacy-copy.js";
import Modal from "../custom-elements/modal.js";
import {customEvents, actions} from "../constants.js";
import {
  create,
  handleTabFocus,
  createFocusTrap,
} from "../utils/helpers.js";
const {getStore, updateStore, subscribeToStore} = store;

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
 * PrivacyModal custom element.
 */
export default class PrivacyModal extends HTMLElement {
  /** Create modal custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.overlay_;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    this.overlay_ = document.querySelector(cssSelector.OVERLAY);

    // listeners
    this.addEventListener("click", this.toggleModal_.bind(this));
    document.addEventListener(
      customEvents.DEFAULT_POLICY, this.toggleModal_.bind(this));
  }

  /**
   * Populates the modal with markup for privacy consent
   * or generic privacy copy.
   * @param {string} type
   * @private
   */
  populateModal_(type) {
    this.appendChild(Modal.createModalIcon(this.toggleModal_.bind(this)));
    const captionEl = create("div", {classname: cssClass.MODAL_CAPTION});

    if (type === "click") {
      Object.entries(copy["DEFAULT"]).forEach((section) => {
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
    } else {
      // consent case
    }
  }

  /**
   * Handles closing of the privacy modal
   * @param {Event} e
   * @private
   */
  toggleModal_(e) {
    e.stopImmediatePropagation();

    const modalIcon = this.querySelector(`.${cssClass.MODAL_ICON}`);

    this.removeContent_();

    if (!modalIcon) {
      // show privacy modal
      this.overlay_.classList.add(cssClass.OVERLAY_DIM);
      this.classList.add(cssClass.MODAL_ACTIVE);
      this.populateModal_(e.type);
      createFocusTrap(this);
    } else {
      this.overlay_.classList.remove(cssClass.OVERLAY_DIM);
      this.classList.remove(cssClass.MODAL_ACTIVE);

      document.dispatchEvent(
        new CustomEvent(customEvents.MODAL_CLOSE));
    }
  }

  /**
   * Removes existing markup from Modal.
   * @private
   */
  removeContent_() {
    const children = Array.from(this.childNodes);

    children.forEach((el) => this.removeChild(el));
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
  }
}
