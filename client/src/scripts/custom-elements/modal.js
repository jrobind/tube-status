import {store} from "../utils/client-store.js";
import {apiSubscribe} from "../utils/api.js";
import {customEvents, actions} from "../constants.js";
import {create, removeSubscriptionId} from "../utils/helpers.js";
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
  MODAL_REASON: "tube-status-modal__reason",
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
  TIME_ELEMENT: "tube-status-time",
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

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    this.overlay_ = document.querySelector(cssSelector.OVERLAY);
    const subscribers = [
      {
        callback: this.updateSelectDaysBtn_.bind(this),
        action: actions.SELECTED_DAYS,
      },
      {
        callback: this.updateSelectTimesBtn_.bind(this),
        action: actions.SELECTED_HOURS,
      },
    ];

    subscribeToStore(subscribers);

    // setup listeners
    document.addEventListener(
      customEvents.LINE_CLICK, this.toggleModal_.bind(this));
    document.addEventListener(
      customEvents.SHOW_SUBSCRIBE, this.renderSubscriptionOptions_.bind(this));
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
    const {selectedSubscriptionWindow: {days}} = getStore();
    const btn = this.querySelector(`.${cssClass.MODAL_SUB_BTN_DAYS}`);

    if (!days) return;

    if (!days.length) {
      btn.textContent = MODAL_DAYS_BTN_TEXT;
      btn.classList.remove(cssClass.BTN_SELECTED);
    } else {
      btn.textContent = BTN_SELECTED_TEXT;
      btn.classList.add(cssClass.BTN_SELECTED);
    }
  }

  /**
   * Updates the 'select times' button state once subscription
   * data has been receieved.
   * @private
   */
  updateSelectTimesBtn_() {
    const {selectedSubscriptionWindow: {hours}} = getStore();
    const btn = this.querySelector(`.${cssClass.MODAL_SUB_BTN_TIMES}`);

    if (!hours) return;

    if (!hours.length) {
      btn.textContent = MODAL_TIMES_BTN_TEXT;
      btn.classList.remove(cssClass.BTN_SELECTED);
    } else {
      btn.textContent = BTN_SELECTED_TEXT;
      btn.classList.add(cssClass.BTN_SELECTED);
    }
  }

  /**
   * Renders markup allowing users to specify
   * subscription timeframes.
   * @param {CustomEvent} e
   * @private
   */
  renderSubscriptionOptions_(e) {
    const subWrapper = create("div", {classname: cssClass.MODAL_SUB});
    const subTitle = create("div", {
      classname: cssClass.MODAL_SUB_TITLE,
      copy: MODAL_SUB_TITLE_TEXT,
    });
    const selectWrapper = create("div", {classname: cssClass.MODAL_SUB_SELECT});
    const selectDaysBtn = create("button", {
      copy: MODAL_DAYS_BTN_TEXT,
      classname: cssClass.MODAL_SUB_BTN_DAYS,
      event: {type: "click", fn: this.emit_.bind(this)},
    });
    const selectTimesBtn = create("button", {
      copy: MODAL_TIMES_BTN_TEXT,
      classname: cssClass.MODAL_SUB_BTN_TIMES,
      event: {type: "click", fn: this.emit_.bind(this)},
    });
    const subscribeBtn = create("button", {
      copy: MODAL_SUB_BTN_TEXT,
      classname: cssClass.MODAL_SUB_BTN,
      event: {type: "click", fn: this.handleSubscriptionRequest_.bind(this)},
    });

    this.line_ = e.detail.line;

    // show modal
    this.overlay_.classList.add(cssClass.OVERLAY_DIM);
    this.classList.add(cssClass.MODAL_ACTIVE);

    this.appendChild(this.createModalIcon_());

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
   * @param {Event} e
   * @private
   */
  async handleSubscriptionRequest_(e) {
    const {
      userProfile,
      pushSubscription,
      selectedSubscriptionWindow,
    } = getStore();

    if (userProfile.signedIn && pushSubscription) {
      const result = await apiSubscribe(
        pushSubscription, this.line_, selectedSubscriptionWindow);
      const {subscription} = result;

      if (subscription.length) {
        updateStore({
          action: actions.LINE_SUBSCRIPTION,
          data: {lineSubscriptions: removeSubscriptionId(subscription)},
        });

        // reset current selected subscription window now we have
        // successfully subscribed
        updateStore({
          action: actions.RESET_SELECTED,
          data: {days: null, hours: null},
        });
      } else {
        this.handleError_(result);
      }

      this.toggleModal_();
    }
  }

  /**
   * Gets the relevant line information from client store.
   * @private
   * @param {array} line
   */
  populateModal_(line) {
    const context = create("div", {classname: cssClass.MODAL_CAPTION});

    line.forEach((info) => {
      const {reason} = info;
      const duplicateReason = context.textContent.trimLeft() === reason;
      const reasonEl = create("div", {classname: cssClass.MODAL_REASON});

      if (!duplicateReason) {
        reasonEl.textContent += ` ${reason}`;
        context.appendChild(reasonEl);
      }

      this.renderDelayContext_(context);
    });
  }

  /**
   * Shows modal with line information relevant to clicked line.
   * @param {CustomEvent=} e
   * @private
   */
  toggleModal_(e) {
    const {lineInformation} = getStore();
    const line = e ? e.detail.line : null;

    // remove old markup before toggling visibility
    this.removeContent_();

    if (line) {
      this.overlay_.classList.add(cssClass.OVERLAY_DIM);
      this.classList.add(cssClass.MODAL_ACTIVE);
      this.populateModal_(lineInformation[line]);
    } else {
      this.overlay_.classList.remove(cssClass.OVERLAY_DIM);
      this.classList.remove(cssClass.MODAL_ACTIVE);

      document.dispatchEvent(
        new CustomEvent(customEvents.MODAL_CLOSE));
    }
  }

  /**
   * Creates modal icon.
   * @private
   * @return {Element}
   */
  createModalIcon_() {
    return create("div", {
      classname: cssClass.MODAL_ICON,
      event: {type: "click", fn: this.toggleModal_.bind(this)},
    });
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
        const name = node.nodeName.toLowerCase();
        const exclude = [cssSelector.WEEK_ELEMENT, cssSelector.TIME_ELEMENT];

        if (!exclude.includes(name)) return node;
      });

    children.forEach((el) => this.removeChild(el));

    updateStore({
      action: actions.RESET_SELECTED,
      data: {days: null, hours: null},
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
      customEvents.LINE_CLICK, this.toggleModal_);
    document.removeEventListener(
      "click", this.handleSubscriptionRequest_);
  }
}
