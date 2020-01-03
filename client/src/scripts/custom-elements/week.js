import {store} from "../utils/client-store.js";
import {actions, customEvents} from "../constants.js";
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
  }

  /** Called every time element is inserted to DOM. */
  connectedCallback() {
    document.addEventListener(
      customEvents.SHOW_WEEK, this.render_.bind(this));
    document.addEventListener(
      customEvents.MODAL_CLOSE, this.toggleActiveState_.bind(this));
  }

  /**
   * Dispatches custom event to app modal containing week days
   * selected for line subscriptions.
   * @param {Event} e
   * @private
   */
  handleSubmitDays_(e) {
    this.toggleActiveState_();

    updateStore({
      action: actions.SELECTED_DAYS,
      data: {days: this.days_, time: null},
    });
  }

  /**
   * Toggle active class state for the custom element.
   * @private
   */
  toggleActiveState_() {
    if (this.classList.contains(cssClass.WEEK_ACTIVE)) {
      this.classList.remove(cssClass.WEEK_ACTIVE);
      // remove markup
      this.removeContent_();
    } else {
      this.classList.add(cssClass.WEEK_ACTIVE);
    }
  }

  /**
   * Removes existing markup from Week.
   * @private
   */
  removeContent_() {
    const children = Array.from(this.childNodes);

    children.forEach((el) => this.removeChild(el));
  }

  /**
   * Renders markup enabling selection of week
   * days for line subscription.
   * @param {CustomEvent} e
   * @private
   */
  render_(e) {
    // if markup already exists then remove it and return
    if (this.querySelector(`.${cssClass.SUBMIT_BTN}`)) {
      this.removeContent_();
      this.toggleActiveState_();
      this.days_ = [];
      return;
    }

    const {subscriptionData} = getStore();
    const submitBtn = document.createElement("button");
    const table = document.createElement("table");
    const tablehead = document.createElement("thead");
    const tableBody = document.createElement("tbody");
    const tableRow = document.createElement("tr");
    const dayKey = {
      0: "Mo",
      1: "Tu",
      2: "We",
      3: "Th",
      4: "Fr",
      5: "Sa",
      6: "Su",
    };
    const days = Array.from(Array(7).keys()).map((n) => {
      const day = document.createElement("th");

      day.classList.add(cssClass.DAY);
      day.innerText = dayKey[n];

      return day;
    });

    this.line_ = e.detail.line;
    this.toggleActiveState_();

    days.forEach((day) => {
      const td = document.createElement("td");

      td.classList.add(cssClass.DAY_SELECT);
      td.setAttribute("day", day.innerText);
      td.addEventListener("click", this.handleDayClick_.bind(this));

      tablehead.appendChild(day);
      tableRow.appendChild(td);
    });

    submitBtn.classList.add(cssClass.SUBMIT_BTN);
    submitBtn.innerText = SUBMIT_BTN_TEXT;
    submitBtn.addEventListener("click", this.handleSubmitDays_.bind(this));

    table.appendChild(tablehead);
    tableBody.appendChild(tableRow);
    table.appendChild(tableBody);
    this.appendChild(table);
    this.appendChild(submitBtn);

    // if selections have already been made then we should pre-select
    // the correct days
    if (subscriptionData.days) {
      const days = Array.from(
        this.querySelectorAll(`.${cssClass.DAY_SELECT}`));
      // set our local days selected reference equal to that within
      // the client store
      this.days_ = subscriptionData.days;
      days.forEach(day => {
        if (this.days_.includes(day.getAttribute("day"))) {
          day.classList.add(cssClass.DAY_SELECT_ACTIVE);
        }
      });
    }
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
      [day]
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
