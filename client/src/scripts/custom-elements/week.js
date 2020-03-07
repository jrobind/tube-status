import {store} from "../utils/client-store.js";
import {actions, customEvents} from "../constants.js";
import {create, returnKeys} from "../utils/helpers.js";
const {updateStore, getStore} = store;

/** @const {string} */
const SUBMIT_BTN_TEXT = "Submit days";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  WEEK_ACTIVE: "tube-status-week--active",
  DAY: "tube-status-week-day",
  DAY_SELECT: "tube-status-week-day__select",
  DAY_SELECT_ACTIVE: "tube-status-week-day__select--active",
  SUBMIT_BTN: "tube-status-week__btn",
  MODAL_SUB_BTN_TIMES: "tube-status-modal-sub__btn-times",
};

/**
 * Week custom element.
 */
export default class Week extends HTMLElement {
  /** Create tube line custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.line_;

    /** @private {array} */
    this.days_ = [];

    /** @private {boolean} */
    this.markupExists_ = false;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    // listeners
    document.addEventListener(
      customEvents.SHOW_WEEK, this.initHandler_.bind(this));
    document.addEventListener(
      customEvents.MODAL_CLOSE, this.reset_.bind(this));
    document.addEventListener("click", this.reset_.bind(this));
  }

  /**
   * Selects pre-selected days if selections have already been made.
   * @private
   */
  handlePreselect_() {
    const {selectedSubscriptionWindow: {days}} = getStore();
    const currentDays = Array.from(
      this.querySelectorAll(`.${cssClass.DAY_SELECT}`));

    // set our local days selected reference equal to that within
    // the client store
    this.days_ = days;

    currentDays.forEach((day) => {
      if (this.days_.includes(day.getAttribute("day"))) {
        day.classList.add(cssClass.DAY_SELECT_ACTIVE);
      }
    });
  }

  /**
   * Manages the correct logic pathway based on certain variable states.
   * @param {CustomEvent} e
   * @private
   */
  initHandler_(e) {
    const {selectedSubscriptionWindow: {days}} = getStore();

    if (this.markupExists_) {
      this.reset_();
    } else {
      this.render_(e);

      // if days are already selected then select them
      if (days) this.handlePreselect_();
    }
  }

  /**
   * Dispatches custom event to app modal containing week days
   * selected for line subscriptions.
   * @private
   */
  handleSubmitDays_() {
    const {selectedSubscriptionWindow: {hours}} = getStore();

    updateStore({
      action: actions.SELECTED_DAYS,
      data: {days: this.days_, hours},
    });

    this.reset_();
  }

  /**
   * Removes existing markup from Week.
   * @private
   * @param {Event=} e
   */
  reset_(e) {
    const children = Array.from(this.childNodes);

    if (e) {
      const target = /** @type {HTMLElement} */ (e.target);

      // if user clicks to display day modal we should reset, otherwise return.
      if (target.classList &&
        !target.classList.contains(cssClass.MODAL_SUB_BTN_TIMES)) return;
    }

    // resets
    this.classList.remove(cssClass.WEEK_ACTIVE);
    this.days_ = [];
    this.markupExists_ = false;

    // remove markup
    children.forEach((el) => this.removeChild(el));
  }

  /**
   * Renders markup enabling selection of week
   * days for line subscription.
   * @param {CustomEvent} e
   * @private
   */
  render_(e) {
    const submitBtn = create("button", {
      classname: cssClass.SUBMIT_BTN,
      event: {type: "click", fn: this.handleSubmitDays_.bind(this)},
      copy: SUBMIT_BTN_TEXT,
    });
    const table = create("table");
    const tablehead = create("thead");
    const tableBody = create("tbody");
    const tableRow = create("tr");
    const days = returnKeys("day")
      .map((day) => create("th", {classname: cssClass.DAY, copy: day}));

    this.line_ = e.detail.line;
    // show element
    this.classList.add(cssClass.WEEK_ACTIVE);

    days.forEach((day) => {
      const td = create("td", {
        classname: cssClass.DAY_SELECT,
        data: {name: "day", value: day.innerText},
        event: {type: "click", fn: this.handleDayClick_.bind(this)},
      });

      tablehead.appendChild(day);
      tableRow.appendChild(td);
    });

    table.appendChild(tablehead);
    tableBody.appendChild(tableRow);
    table.appendChild(tableBody);
    this.appendChild(table);
    this.appendChild(submitBtn);
    this.markupExists_ = true;
  }

  /**
   * Persist week day(s) selected.
   * @param {Event} e
   * @private
   */
  handleDayClick_(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const day = target.getAttribute("day");
    const isActive = target.classList.contains(
      cssClass.DAY_SELECT_ACTIVE);

    if (isActive) {
      target.classList.remove(cssClass.DAY_SELECT_ACTIVE);

      // remove day
      this.days_ = this.days_.filter((currentDay) => {
        return day !== currentDay;
      });
    } else {
      target.classList.add(cssClass.DAY_SELECT_ACTIVE);

      // do not add duplicate days
      this.days_ = !this.days_.includes(day) ?
        [...this.days_, day] :
        [day];
    }

    console.log(this.days_);
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
