import {store} from "../utils/client-store.js";
import {actions, customEvents} from "../constants.js";
import {createEl} from "../utils/helpers.js";
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
};

/**
 * Tube line custom element.
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
    document.addEventListener(
      customEvents.SHOW_WEEK, this.initHandler_.bind(this));
    document.addEventListener(
      customEvents.MODAL_CLOSE, this.reset_.bind(this));
  }

  /**
   * Selects pre-selected days if selections have already been made.
   * @private
   */
  handlePreselect_() {
    const {subscriptionData} = getStore();
    const days = Array.from(
      this.querySelectorAll(`.${cssClass.DAY_SELECT}`));

    // set our local days selected reference equal to that within
    // the client store
    this.days_ = subscriptionData.days;
    days.forEach((day) => {
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
    const {subscriptionData} = getStore();

    if (this.markupExists_) {
      this.reset_();
    } else {
      this.render_(e);

      // if days are already selected then select them
      if (subscriptionData.days) this.handlePreselect_();
    }
  }

  /**
   * Dispatches custom event to app modal containing week days
   * selected for line subscriptions.
   * @private
   */
  handleSubmitDays_() {
    updateStore({
      action: actions.SELECTED_DAYS,
      data: {days: this.days_, time: null},
    });

    this.reset_();
  }

  /**
   * Removes existing markup from Week.
   * @private
   */
  reset_() {
    const children = Array.from(this.childNodes);

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
    const submitBtn = createEl({
      elType: "button",
      attributes: {classname: cssClass.SUBMIT_BTN},
      event: {eventType: "click", func: this.handleSubmitDays_.bind(this)},
      copy: SUBMIT_BTN_TEXT,
    });
    const table = createEl("table");
    const tablehead = createEl("thead");
    const tableBody = createEl("tbody");
    const tableRow = createEl("tr");
    const dayKey = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    const days = Array.from(Array(7).keys()).map((n) => {
      return createEl({
        elType: "th",
        attributes: {classname: cssClass.DAY},
        copy: dayKey[n],
      });
    });

    this.line_ = e.detail.line;
    // show element
    this.classList.add(cssClass.WEEK_ACTIVE);

    days.forEach((day) => {
      const td = createEl({
        elType: "td",
        attributes: {
          classname: cssClass.DAY_SELECT,
          data: {name: "day", value: day.innerText},
        },
        event: {eventType: "click", func: this.handleDayClick_.bind(this)},
      });

      td.classList.add(cssClass.DAY_SELECT);
      td.setAttribute("day", day.innerText);
      td.addEventListener("click", this.handleDayClick_.bind(this));

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
