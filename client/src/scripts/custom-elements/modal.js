import {store} from "../utils/client-store.js";
import {apiSubscribe} from "../utils/api.js";
import {customEvents, actions, copy} from "../constants.js";
import {
  create,
  removeSubscriptionId,
  removeDuplicate,
  handleTabFocus,
  createFocusTrap,
  handleModalScroll,
} from "../utils/helpers.js";
const {getStore, updateStore, subscribeToStore} = store;

/** @const {number} */
const LOADING_DELAY = 500;

/** @const {string} */
const MODAL_SUB_TITLE_TEXT = "Specify your subscription times:";

/** @const {string} */
const ERROR_MESSAGE = "Push subscription object not found";

/** @const {string} */
const MODAL_DAYS_BTN_TEXT = "Select days";

/** @const {string} */
const MODAL_TIMES_BTN_TEXT = "Select times";

/** @const {string} */
const MODAL_SUB_BTN_TEXT = "Subscribe";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  MODAL_ACTIVE: "tube-status-modal--active",
  MODAL_SUBSCRIBE: "tube-status-modal--subscribe",
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
  WEEK_ELEMENT: "tube-status-week",
  TIME_ELEMENT: "tube-status-time",
  BTN: "tube-status-btn",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  OVERLAY: ".overlay",
  TOAST: ".tube-status-toast",
  APP: ".app",
};

/**
 * Modal custom element.
 */
export default class Modal extends HTMLElement {
  /** Create modal custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.overlay_ = document.querySelector(cssSelector.OVERLAY);

    /** @private {HTMLElement} */
    this.app_ = document.querySelector(cssSelector.APP);

    /** @private {HTMLElement} */
    this.invokingContext_;

    /** @private {string} */
    this.line_;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
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

    // listeners
    document.addEventListener(
      customEvents.LINE_CLICK, this.toggleModal_.bind(this));
    document.addEventListener(
      customEvents.SHOW_SUBSCRIBE, this.renderSubscriptionOptions_.bind(this));
    document.addEventListener("keyup", this.handleKeyUp_.bind(this));
  }

  /**
   * Handler for a keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyUp_(e) {
    e.stopImmediatePropagation();

    e.which === 27 && this.toggleModal_();
  }

  /**
   * Emits a custom event to be consumed by
   * week and day custom elements.
   * @param {Event} e
   * @private
   */
  emit_(e) {
    const {target} = e;

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
    const {selectedSubscriptionWindow: {days, hours}} = getStore();
    const btn = this.querySelector(`.${cssClass.MODAL_SUB_BTN_DAYS}`);

    if (!days) return;

    if (!days.length) {
      btn.textContent = MODAL_DAYS_BTN_TEXT;
      btn.classList.remove(cssClass.BTN_SELECTED);
    } else {
      btn.textContent = "Days selected";
      btn.classList.add(cssClass.BTN_SELECTED);

      if (hours) {
        this.querySelector(`.${cssClass.MODAL_SUB_BTN}`).disabled = false;
      }
    }
  }

  /**
   * Updates the 'select times' button state once subscription
   * data has been receieved.
   * @private
   */
  updateSelectTimesBtn_() {
    const {selectedSubscriptionWindow: {hours, days}} = getStore();
    const btn = this.querySelector(`.${cssClass.MODAL_SUB_BTN_TIMES}`);

    if (!hours) return;

    if (!hours.length) {
      btn.textContent = MODAL_TIMES_BTN_TEXT;
      btn.classList.remove(cssClass.BTN_SELECTED);
    } else {
      btn.textContent = "Times selected";
      btn.classList.add(cssClass.BTN_SELECTED);

      if (days) {
        this.querySelector(`.${cssClass.MODAL_SUB_BTN}`).disabled = false;
      }
    }
  }

  /**
   * Renders markup allowing users to specify
   * subscription timeframes.
   * @param {CustomEvent} e
   * @private
   */
  renderSubscriptionOptions_(e) {
    const timeAndDayBtnEvents = [
      {type: "click", fn: this.emit_.bind(this)},
      {type: "keyup", fn: handleTabFocus},
    ];
    const subscribeBtnEvents = [
      {type: "click", fn: this.handleSubscriptionRequest_.bind(this)},
      {type: "keyup", fn: handleTabFocus},
    ];

    const subWrapper = create("div", {classname: cssClass.MODAL_SUB});
    const selectWrapper = create("div", {classname: cssClass.MODAL_SUB_SELECT});

    const subTitle = create("div", {
      classname: cssClass.MODAL_SUB_TITLE,
      copy: MODAL_SUB_TITLE_TEXT,
    });

    const selectDaysBtn = create("button", {
      copy: MODAL_DAYS_BTN_TEXT,
      classname: [cssClass.MODAL_SUB_BTN_DAYS, cssClass.BTN],
      event: timeAndDayBtnEvents,
      data: {name: "tabindex", value: "0"},
    });

    const selectTimesBtn = create("button", {
      copy: MODAL_TIMES_BTN_TEXT,
      classname: [cssClass.MODAL_SUB_BTN_TIMES, cssClass.BTN],
      event: timeAndDayBtnEvents,
      data: {name: "tabindex", value: "0"},
    });

    const subscribeBtn = create("button", {
      copy: MODAL_SUB_BTN_TEXT,
      classname: [cssClass.MODAL_SUB_BTN, cssClass.BTN],
      event: subscribeBtnEvents,
      data: [{name: "tabindex", value: "0"}, {name: "disabled", value: ""}],
    });

    this.line_ = e.detail.line;

    // show modal
    this.overlay_.classList.add(cssClass.OVERLAY_DIM);
    this.classList.add(cssClass.MODAL_ACTIVE);
    this.classList.add(cssClass.MODAL_SUBSCRIBE);

    this.appendChild(Modal.createModalIcon(this.toggleModal_.bind(this)));

    selectWrapper.appendChild(selectDaysBtn);
    selectWrapper.appendChild(selectTimesBtn);

    // append markup content to modal
    [subTitle, selectWrapper, subscribeBtn]
      .forEach((el) => subWrapper.appendChild(el));

    this.appendChild(subWrapper);

    // set focus and focus trap for modal
    this.setAttribute("tabindex", "0");
    this.focus();
    createFocusTrap(this);
    handleModalScroll();
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
      const result = await apiSubscribe(this.line_, selectedSubscriptionWindow);
      const {subscription} = result;
      const toastEl = /** @type {HTMLElement} */ (
        document.querySelector(cssSelector.TOAST));

      if (subscription.length) {
        this.toggleModal_();

        updateStore({
          action: actions.LOADING_LINE,
          data: {loadingState: {state: true, line: this.line_}},
        });

        // set a minimum loading wheel time
        await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY));

        updateStore({
          action: actions.LOADING_LINE,
          data: {loadingState: {state: false, line: this.line_}},
        });

        updateStore({
          action: actions.LINE_SUBSCRIBE,
          data: {lineSubscriptions: removeSubscriptionId(subscription)},
        });

        // reset current selected subscription window now we have
        // successfully subscribed
        updateStore({
          action: actions.RESET_SELECTED,
          data: {days: null, hours: null},
        });

        toastEl.setAttribute("subscribe", "");
      } else {
        this.handleError_(result);
      }
    } else {
      this.handleError_(ERROR_MESSAGE);
    }
  }

  /**
   * Gets the relevant line information from client store.
   * @private
   * @param {string} line
   * @param {array} lines
   */
  populateModal_(line, lines) {
    const context = create("div", {classname: cssClass.MODAL_CAPTION});

    lines.forEach((info) => {
      const {reason} = info;
      const duplicateReason = context.textContent.trimLeft() === reason;
      const reasonEl = create("div", {classname: cssClass.MODAL_REASON});

      if (!duplicateReason) {
        reasonEl.textContent += ` ${reason}`;
        context.appendChild(reasonEl);
      }

      this.renderDelayContext_(context);
    });

    this.setAttribute("tabindex", "0");
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-hidden", "false");
    this.app_.setAttribute("aria-hidden", "true");
    this.setAttribute("aria-label", `${line} line disruption description`);
    this.focus();
  }

  /**
   * Toggles modal with line information relevant to clicked line.
   * @param {CustomEvent=} e
   * @private
   */
  toggleModal_(e) {
    const which = e ? e.which : null;
    const type = e ? e.type : null;
    const modalIconEl = /** @type {HTMLImageElement} */ (
      document.querySelector(`.${cssClass.MODAL_ICON}`));
    const enterKey = which === 13;
    const clicked = type === "line-click" || type === "click";

    if (clicked || enterKey || !e) {
      const {lineInformation} = getStore();
      const line = e ? e.detail.line : null;

      if (e && e.detail.el) {
        this.invokingContext_ = e ? e.detail.el : null;
      }

      // remove old markup before toggling visibility
      this.removeContent_();

      if (line) {
        this.overlay_.classList.add(cssClass.OVERLAY_DIM);
        this.classList.add(cssClass.MODAL_ACTIVE);
        this.populateModal_(line, removeDuplicate(lineInformation[line]));

        createFocusTrap(this);
        handleModalScroll();
      } else {
        this.overlay_.classList.remove(cssClass.OVERLAY_DIM);
        this.classList.remove(cssClass.MODAL_ACTIVE);
        this.classList.remove(cssClass.MODAL_SUBSCRIBE);

        document.dispatchEvent(
          new CustomEvent(customEvents.MODAL_CLOSE));
        handleModalScroll();
        this.setAttribute("aria-hidden", "true");
        this.app_.setAttribute("aria-hidden", "false");

        // return focus to invoking context
        this.invokingContext_ && this.invokingContext_.focus();
      }
    } else if (which === 9) {
      handleTabFocus(modalIconEl);
    }
  }

  /**
   * Creates modal icon.
   * @param {function} boundFn
   * @static
   * @return {Element}
   */
  static createModalIcon(boundFn) {
    const events = [
      {type: "click", fn: boundFn},
      {type: "keyup", fn: boundFn},
      {type: "keypress", fn: boundFn},
    ];

    return create("div", {
      classname: cssClass.MODAL_ICON,
      event: events,
      data: {name: "tabindex", value: "0"},
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
      this.appendChild(Modal.createModalIcon(this.toggleModal_.bind(this)));
      this.appendChild(context);
    } else {
      this.appendChild(Modal.createModalIcon(this.toggleModal_.bind(this)));
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
        const exclude = [cssClass.WEEK_ELEMENT, cssClass.TIME_ELEMENT];

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
   * @param {object|string} e
   * @private
   */
  handleError_(e) {
    console.error(`${copy.SUBSCRIPTION_ERROR_MSG} ${e}`);
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener(
      customEvents.LINE_CLICK, this.toggleModal_);
    document.removeEventListener(
      customEvents.SHOW_SUBSCRIBE, this.renderSubscriptionOptions_);
    document.removeEventListener("keyup", this.handleKeyUp_);
  }
}
