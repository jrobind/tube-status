import {store} from "../utils/client-store.js";
import {actions, delayTypes, customEvents} from "../constants.js";
const {subscribeToStore, getStore} = store;

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  DAY: "tube-status-week-day",
  DAY_SELECT: "tube-status-week-day__select"
};

/**
 * Tube line custom element.
 */
export default class Week extends HTMLElement {
  /** Create tube line custom element. */
  constructor() {
    super();

    /** @private {array} */
    this.days_;
  }

  /** Called every time element is inserted to DOM. */
  connectedCallback() {
    document.addEventListener(
      customEvents.SHOW_WEEK, this.render_.bind(this));
  }

  /**
   * Dispatches custom event to app modal containing week days
   * required for line subscriptions.
   * @param {Event} e
   * @private
   */
  handleClick_(e) {
    const detail = {detail: {line: this.days_}};

    document.dispatchEvent(
      new CustomEvent(customEvents.DAYS, detail));
  }

  /**
   * Renders markup enabling selection of week
   * days for line subscription.
   * @private
   */
  render_() {
    const table = document.createElement("table");
    const tablehead = document.createElement("thead");
    const tableBody = document.createElement("tbody");
    const tableRow = document.createElement("tr");
    const dayKey = {
      0: "Monday",
      1: "Tuesday",
      2: "Wednesday",
      3: "Thursday",
      4: "Friday",
      5: "Saturday",
      6: "Sunday"
    };
    const days = Array.from(Array(7).keys()).map((n) => {
      const day = document.createElement("th");

      day.classList.add(cssClass.DAY);
      day.innerText = dayKey[n];
      
      return day;
    });

    days.forEach((day) => {
      const td = document.createElement("td");

      td.classList.add(cssClass.DAY_SELECT);
      td.setAttribute("day", day.innerText);

      tablehead.appendChild(day);
      tableRow.appendChild(td);
    });
  
    table.appendChild(tablehead);
    tableBody.appendChild(tableRow);
    table.appendChild(tableBody);
    this.appendChild(table);
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener(
      customEvents.SHOW_WEEK, this.render_);
  }
}
