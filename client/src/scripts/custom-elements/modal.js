import {store} from "../utils/client-store.js";
import {apiSubscribe} from "../utils/api.js";
import {customEvents, actions} from "../constants.js";
const {getStore, updateStore} = store;

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

    // setup listeners
    document.addEventListener(
      customEvents.LINE_CLICK, this.toggleModal_.bind(this));
    document.addEventListener(
      customEvents.SUBSCRIBE, this.handleSubscriptionRequest_.bind(this));
  }

/**
   * Handles line subscription request.
   * @async
   * @param {CustomEvent} e
   * @private
   */
  async handleSubscriptionRequest_(e) {
    const {userProfile, pushSubscription, lineSubscriptions} = getStore();
    const {line} = e.detail;

    // remove content, then show modal
    this.removeContent_();
    this.overlay_.classList.add(cssClass.OVERLAY_DIM);
    this.classList.add(cssClass.MODAL_ACTIVE);

    if (userProfile.signedIn && pushSubscription) {
      // push new line subscription to stored array if subscribing,
      // otherwise remove unsubscribed line
      const result = await apiSubscribe(pushSubscription, line);

      result.lines ?
        lineSubscriptions.push(result.lines) :
        this.handleError_(result);

      updateStore({
        action: actions.LINE_SUBSCRIPTION,
        data: {lineSubscriptions},
      });
    }
  }

  /**
   * Gets the relevant line information from client store.
   * @private
   * @param {string} line
   */
  populateModal_(line) {
    const lineInfo = getStore().lineInformation[line];
    const context = document.createElement("div");

    lineInfo.forEach((info) => {
      const {reason} = info;
      const duplicateReason = context.textContent.trimLeft() === reason;

      context.classList.add(cssClass.MODAL_CAPTION);
      !duplicateReason ? context.textContent += ` ${reason}` : null;

      this.render_(context);
    });
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
      // remove existing markup before appending new context
      this.removeContent_();
      this.appendChild(modalIcon);
      this.appendChild(context);
    } else {
      this.appendChild(modalIcon);
      this.appendChild(context);
    }
  }

  /**
   * Removes existing markup from Modal.
   * @private
   */
  removeContent_() {
    const contextEl = this.querySelector(`.${cssClass.MODAL_CAPTION}`);
    const modalIconEl = this.querySelector(`.${cssClass.MODAL_ICON}`);
    const parent = this;
    const children = [contextEl, modalIconEl]

    children.forEach((el) => parent.removeChild(el));
  }

  /**
   * Handles api fetch errors.
   * @param {object} e
   * @private
   */
  handleError_(e) {
    console.error(`Unable to subscribe to line at this time. ${e}`);
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener(
      actions.LINE_CLICK, this.toggleModal_);
    document.removeEventListener(
      actions.SUBSCRIBE, this.handleSubscriptionRequest_);
  }
}
