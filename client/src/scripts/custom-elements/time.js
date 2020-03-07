import {store} from "../utils/client-store.js";
import {actions, customEvents} from "../constants.js";
import {
  create,
  returnKeys,
  handleTabFocus,
  createFocusTrap,
} from "../utils/helpers.js";
import Tooltip from "./tooltip.js";
const {updateStore, getStore} = store;

/** @const {string} */
const SUBMIT_BTN_TEXT = "Submit time range";

/** @const {string} */
const TOOLTIP_MESSAGE =
  "Please select a range of a least one hour i.e. 09:00 – 10:00.";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  TIME_ACTIVE: "tube-status-time--active",
  HOUR: "tube-status-time-hour",
  HOUR_SELECT: "tube-status-time-hour__select",
  HOUR_SELECT_ACTIVE: "tube-status-time-hour__select--active",
  SUBMIT_BTN: "tube-status-time__btn",
  MODAL_SUB_BTN_DAYS: "tube-status-modal-sub__btn-days",
  TABLE_WRAPPER: "tube-status-time__table-wrapper",
};

/**
* CSS class selectors.
* @enum {string}
*/
const cssSelector = {
  TOOLTIP: ".tube-status-tooltip",
  TOOLTIP_MESSAGE: ".tube-status-tooltip__message",
};

/**
 * Tube line custom element.
 */
export default class Time extends HTMLElement {
  /** Create tube line custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.line_;

    /** @private {array} */
    this.hours_ = [];

    /** @private {boolean} */
    this.markupExists_ = false;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    // listeners
    document.addEventListener(
      customEvents.SHOW_TIME, this.initHandler_.bind(this));
    document.addEventListener(
      customEvents.MODAL_CLOSE, this.reset_.bind(this));
    document.addEventListener("click", this.reset_.bind(this));
  }

  /**
   * Selects pre-selected hour range if selections have already been made.
   * @private
   */
  handlePreselect_() {
    const {selectedSubscriptionWindow: {hours}} = getStore();
    const currentHours = Array.from(
      this.querySelectorAll(`.${cssClass.HOUR_SELECT}`));

    // set our locally stored hours reference equal to that within
    // the client store
    this.hours_ = hours;

    currentHours.forEach((hr) => {
      if (this.hours_.includes(+hr.getAttribute("hour"))) {
        hr.classList.add(cssClass.HOUR_SELECT_ACTIVE);
      }
    });
  }

  /**
   * Manages the correct logic pathway based on certain variable states.
   * @param {CustomEvent} e
   * @private
   */
  initHandler_(e) {
    const {selectedSubscriptionWindow: {hours}} = getStore();

    if (this.markupExists_) {
      this.reset_();
    } else {
      this.render_(e);

      // if hours are already selected then select them
      if (hours) this.handlePreselect_();
    }
  }

  /**
   * Dispatches custom event to app modal containing hours
   * selected for line subscriptions.
   * @private
   */
  handleSubmitHours_() {
    const {selectedSubscriptionWindow: {days}} = getStore();
    const tooltipExists = this.querySelector(cssSelector.TOOLTIP_MESSAGE);
    const styles = {bottom: "-45px", left: "-60px"};

    if (this.hours_.length === 1) {
      if (tooltipExists) return;

      // render and and insert tooltip
      this.querySelector(`.${cssClass.SUBMIT_BTN}`)
        .insertAdjacentElement(
          "afterend", new Tooltip(TOOLTIP_MESSAGE, styles));

      return;
    }

    updateStore({
      action: actions.SELECTED_HOURS,
      data: {days, hours: this.hours_},
    });

    this.reset_();
  }

  /**
   * Removes existing markup from Time.
   * @param {Event=} e
   * @private
   */
  reset_(e) {
    const children = Array.from(this.childNodes);

    if (e) {
      const target = /** @type {HTMLElement} */ (e.target);

      // if user clicks to display day modal we should reset, otherwise return.
      if (target.classList &&
        !target.classList.contains(cssClass.MODAL_SUB_BTN_DAYS)) return;
    }

    // resets
    this.classList.remove(cssClass.TIME_ACTIVE);
    this.hours_ = [];
    this.markupExists_ = false;

    // remove markup
    children.forEach((el) => this.removeChild(el));
  }

  /**
   * Renders markup enabling selection of hours for line subscription.
   * @param {CustomEvent} e
   * @private
   */
  render_(e) {
    const submitBtnEvents = [
      {type: "click", fn: this.handleSubmitHours_.bind(this)},
      {type: "keyup", fn: handleTabFocus},
    ];
    const submitBtn = create("button", {
      classname: cssClass.SUBMIT_BTN,
      copy: SUBMIT_BTN_TEXT,
      data: {name: "tabindex", value: "0"},
      event: submitBtnEvents,
    });
    const tableWrapper = create("div", {classname: cssClass.TABLE_WRAPPER});
    const table = create("table");
    const tablehead = create("thead");
    const tableBody = create("tbody");
    const tableRow = create("tr");
    const hours = returnKeys("hours")
      .map((hr) => create("th", {classname: cssClass.HOUR, copy: hr}));

    this.line_ = e.detail.line;
    // show element
    this.classList.add(cssClass.TIME_ACTIVE);

    hours.forEach((hr) => {
      const attributes = [
        {name: "hour", value: hr.innerText},
        {name: "tabindex", value: "0"},
      ];
      const events = [
        {type: "click", fn: this.handleHourClick_.bind(this)},
        {type: "keydown", fn: this.handleHourClick_.bind(this)},
        {type: "keyup", fn: handleTabFocus},
      ];
      const td = create("td", {
        classname: cssClass.HOUR_SELECT,
        data: attributes,
        event: events,
      });

      tablehead.appendChild(hr);
      tableRow.appendChild(td);
    });

    table.appendChild(tablehead);
    tableBody.appendChild(tableRow);
    table.appendChild(tableBody);
    tableWrapper.appendChild(table);

    this.appendChild(tableWrapper);
    this.appendChild(submitBtn);

    this.markupExists_ = true;

    // set focus and focus trap for modal
    this.setAttribute("tabindex", "0");
    this.focus();
    createFocusTrap(this);
  }

  /**
   * Persist hour(s) selected.
   * @param {Event} e
   * @private
   */
  handleHourClick_(e) {
    const {target, which, type} = e;

    if (type === "click" || which === 13) {
      const hour = +target.getAttribute("hour");
      const isActive = target.classList.contains(
        cssClass.HOUR_SELECT_ACTIVE);

      if (isActive) {
        const active = this.querySelectorAll(`
          .${cssClass.HOUR_SELECT_ACTIVE}`);

        // remove all active selections
        active.forEach((el) => el.classList.remove(
          cssClass.HOUR_SELECT_ACTIVE));
        this.hours_ = [];
      } else {
        target.classList.add(cssClass.HOUR_SELECT_ACTIVE);
        // if an hour has already been selected we must create a range
        if (!this.hours_.length) {
          this.hours_ = [hour];
        } else {
          this.hours_ = this.createRange_(hour);

          // add active class to elements within selected range
          this.hours_.forEach((hr) => {
            this.querySelector(`[hour="${hr}"]`)
              .classList.add(cssClass.HOUR_SELECT_ACTIVE);
          });
        }
      }

      console.log(this.hours_);
    }
  }

  /**
   * Creates hour range defined by user.
   * @param {number} hour
   * @return {Array<number>}
   * @private
   */
  createRange_(hour) {
    const current = [...this.hours_, hour].sort((a, b) => a - b);
    const range = [current[0]];
    const difference = (current[current.length - 1] - current[0]) - 1;

    for (let i = 0; i <= difference; i++) {
      range.push(range[range.length - 1] + 1);
    }

    return range;
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener(
      customEvents.SHOW_WEEK, this.render_);
    // TODO: remove remaining td element listeners
  }
}
