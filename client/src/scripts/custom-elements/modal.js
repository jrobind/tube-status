import {store} from "../utils/client-store.js";
import {apiSubscribe} from "../utils/api.js";
import {customEvents, actions} from "../constants.js";
const {getStore, updateStore, subscribeToStore} = store;

/** @const {string} */
const MODAL_SUB_TITLE_TEXT = "Specify your subscription times:";

/** @const {string} */
const MODAL_DAYS_BTN_TEXT = "Select days";

/** @const {string} */
const MODAL_TIMES_BTN_TEXT = "Select times";

/** @const {string} */
const MODAL_SUB_BTN_TEXT = "Subscribe";

/** @const {string} */
const BTN_SELECTED_TEXT = "Selected";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  MODAL_ACTIVE: "tube-status-modal--active",
  MODAL_CAPTION: "tube-status-modal__caption",
  MODAL_ICON: "tube-status-modal__icon",
  OVERLAY_DIM: "dim",
  MODAL_SUB: "tube-status-modal-sub",
  MODAL_SUB_TITLE: "tube-status-modal-sub__title",
  MODAL_SUB_SELECT: "tube-status-modal-sub__select",
  MODAL_SUB_BTN: "tube-status-modal-sub__btn",
  MODAL_SUB_BTN_TIMES: "tube-status-modal-sub__btn-times",
  MODAL_SUB_BTN_DAYS: "tube-status-modal-sub__btn-days",
  BTN_SELECTED: "tube-status-btn--selected",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  OVERLAY: ".overlay",
  WEEK_ELEMENT: "tube-status-week",
};

/**
 * Modal custom element.
 */
export default class Modal extends HTMLElement {
  /** Create modal custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.overlay_;

    /** @private {string} */
    this.line_;
  }

  /** Called every time element is inserted to DOM. */
  connectedCallback() {
    this.overlay_ = document.querySelector(cssSelector.OVERLAY);
    const subscribers = [
      {
        callback: this.updateSelectDaysBtn_.bind(this),
        action: actions.SELECTED_DAYS,
      },
      {
        callback: this.handleSubscriptionRequest_.bind(this),
        action: actions.SELECTED_DAYS,
      }
    ];

    subscribeToStore(subscribers);

    // setup listeners
    document.addEventListener(
      customEvents.LINE_CLICK, this.toggleModal_.bind(this));
    document.addEventListener(
      customEvents.SUBSCRIBE, this.renderSubscriptionOptions_.bind(this));
  }

  /**
   * Emits a custom event to be consumed by
   * week and day custom elements.
   * @param {Event} e
   * @private
   */
  emit_(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const detail = {detail: {line: this.line_}};
    let customDispatchEvent;

    if (target.classList.contains(cssClass.MODAL_SUB_BTN_DAYS)) {
      customDispatchEvent = customEvents.SHOW_WEEK;
    } else {
      customDispatchEvent = customEvents.SHOW_TIME;
    }

    document.dispatchEvent(
      new CustomEvent(customDispatchEvent, detail));
  }

  /**
   * Updates the 'select days' button state once subscription
   * data has been receieved.
   * @private
   */
  updateSelectDaysBtn_() {
    const {subscriptionData} = getStore();

    if (!subscriptionData.days) return;

    const btn = this.querySelector(`.${cssClass.MODAL_SUB_BTN_DAYS}`);
    
    btn.textContent = BTN_SELECTED_TEXT;
    btn.classList.add(cssClass.BTN_SELECTED);
  }

  /**
   * Renders markup allowing users to specify
   * subscription timeframes.
   * @param {CustomEvent} e
   * @private
   */
  renderSubscriptionOptions_(e) {
    const subWrapper = document.createElement("div");
    const subTitle = document.createElement("div");
    const selectWrapper = document.createElement("div");
    const selectDaysBtn = document.createElement("button");
    const selectTimesBtn = document.createElement("button");
    const subscribeBtn = document.createElement("button");

    this.line_ = e.detail.line;

    // show modal
    this.overlay_.classList.add(cssClass.OVERLAY_DIM);
    this.classList.add(cssClass.MODAL_ACTIVE);

    this.appendChild(this.createModalIcon_());

    subWrapper.classList.add(cssClass.MODAL_SUB);

    subTitle.textContent = MODAL_SUB_TITLE_TEXT;
    subTitle.classList.add(cssClass.MODAL_SUB_TITLE);

    selectWrapper.classList.add(cssClass.MODAL_SUB_SELECT);

    selectDaysBtn.textContent = MODAL_DAYS_BTN_TEXT;
    selectTimesBtn.textContent = MODAL_TIMES_BTN_TEXT;
    subscribeBtn.textContent = MODAL_SUB_BTN_TEXT;

    selectDaysBtn.classList.add(cssClass.MODAL_SUB_BTN_DAYS);
    selectTimesBtn.classList.add(cssClass.MODAL_SUB_BTN_TIMES);
    subscribeBtn.classList.add(cssClass.MODAL_SUB_BTN);

    selectDaysBtn.addEventListener(
      "click",
      this.emit_.bind(this));

    subscribeBtn.addEventListener(
      "click",
      this.emit_.bind(this));

    subscribeBtn.addEventListener(
      "click",
      this.handleSubscriptionRequest_.bind(this));

    selectWrapper.appendChild(selectDaysBtn);
    selectWrapper.appendChild(selectTimesBtn);

    // append markup content to modal
    [subTitle, selectWrapper, subscribeBtn]
      .forEach((el) => subWrapper.appendChild(el));

    this.appendChild(subWrapper);
  }

  /**
   * Handles line subscription request.
   * @async
   * @param {CustomEvent} e
   * @private
   */
  async handleSubscriptionRequest_(e) {
    const {
      userProfile,
      pushSubscription,
      lineSubscriptions,
      subscriptionData,
    } = getStore();

    console.log('reaching subscription data', subscriptionData);

    // if (userProfile.signedIn && pushSubscription) {
    //   // push new line subscription to stored array if subscribing,
    //   // otherwise remove unsubscribed line
    //   const result = await apiSubscribe(pushSubscription, this.line_);

    //   result.lines ?
    //     lineSubscriptions.push(result.lines) :
    //     this.handleError_(result);

    //   updateStore({
    //     action: actions.LINE_SUBSCRIPTION,
    //     data: {lineSubscriptions},
    //   });
    // }
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

      this.renderDelayContext_(context);
    });
  }

  /**
   * Shows modal with line information releavnt to clicked line.
   * @param {CustomEvent} e
   * @private
   */
  toggleModal_(e) {
    const {line} = e.detail;

    document.dispatchEvent(
      new CustomEvent(customEvents.MODAL_CLOSE));

    // remove old markup before toggling visibility
    this.removeContent_();

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
   * Creates modal icon.
   * @private
   * @return {Element}
   */
  createModalIcon_() {
    const modalIcon = document.createElement("div");

    modalIcon.classList.add(cssClass.MODAL_ICON);
    modalIcon.addEventListener("click", this.toggleModal_.bind(this));

    return modalIcon;
  }

  /**
   * Renders delay context markup specifc to line clicked.
   * @param {Element} context
   * @private
   */
  renderDelayContext_(context) {
    const captionEl = this.querySelector(`.${cssClass.MODAL_CAPTION}`);

    if (captionEl) {
      // remove existing markup before appending new context
      this.removeContent_();
      this.appendChild(this.createModalIcon_());
      this.appendChild(context);
    } else {
      this.appendChild(this.createModalIcon_());
      this.appendChild(context);
    }
  }

  /**
   * Removes existing markup from Modal.
   * @private
   */
  removeContent_() { 
    const children = Array.from(this.childNodes)
      .filter((node) => {
        return node.nodeName.toLowerCase() !== cssSelector.WEEK_ELEMENT
      });

    children.forEach((el) => this.removeChild(el));

    updateStore({
      action: actions.SELECTED_DAYS,
      data: {days: null, time: null},
    });
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
