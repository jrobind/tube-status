import {store} from "../utils/client-store.js";
import {actions, delayTypes, customEvents} from "../constants.js";
import {removeDuplicate, handleTabFocus} from "../utils/helpers.js";
const {subscribeToStore, getStore} = store;

/** @const {string} */
const AUTH_ELEMENT_NAME = "TUBE-STATUS-AUTHENTICATION";

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  STATUS_WRAPPER: "tube-status-wrapper",
  SUB_STATUS: "tube-line-sub__status",
  LINE_SUB: "tube-line-sub",
  INFO_REASON_TITLE: "tube-line-info__reason-title",
  ACTIVE: "tube-line--active",
};

/**
 * Tube line custom element.
 */
export default class TubeLine extends HTMLElement {
  /** Create tube line custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.line_ = this.getAttribute("line");

    /** @private {HTMLElement} */
    this.tubeStatusWrapper_;

    /** @private {HTMLElement} */
    this.subStatusEl_;

    /** @private {HTMLElement} */
    this.reasonTitleEl_;

    /** @private {boolean} */
    this.connectedCalled_ = false;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    if (this.connectedCalled_) return;

    subscribeToStore({
      callback: this.updateDOM_.bind(this),
      action: actions.LINES,
    });

    // listeners
    this.addEventListener("click", this.handleClick_.bind(this));
    this.addEventListener("keyup", (e) => {
      e.which === 9 && handleTabFocus(this);
    });
    this.addEventListener("keypress", (e) => {
      e.which === 13 && this.handleClick_(e);
    });

    this.tubeStatusWrapper_ = document.querySelector(
      `.${cssClass.STATUS_WRAPPER}`);
    this.subStatusEl_ = this.querySelector(
      `.${cssClass.SUB_STATUS}`);
    this.reasonTitleEl_ = this.querySelector(
      `.${cssClass.INFO_REASON_TITLE}`);

    this.connectedCalled_ = true;
  }

  /**
   * Dispatches custom click event to toggle app modal.
   * @param {Event} e
   * @private
   */
  handleClick_(e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const detail = {detail: {line: this.line_}};
    const isActive = this.classList.contains(cssClass.ACTIVE);
    const isAuthEl = target.parentNode.nodeName === AUTH_ELEMENT_NAME;

    // return if the line is not active or the element clicked
    // is an authentication custom element
    if (!isActive || isAuthEl) return;

    document.dispatchEvent(
      new CustomEvent(customEvents.LINE_CLICK, detail));
  }

  /**
   * Updates DOM with every new line status.
   * @private
   */
  updateDOM_() {
    const {lineInformation} = getStore();
    const lineInfo = removeDuplicate(lineInformation[this.line_]);

    lineInfo.forEach((info, i)=> {
      const {status, reason} = info;
      const last = i === lineInfo.length -1;
      const pipe = last ? "" : " | ";

      // set score attribute on line so we can order with flexbox
      this.setScoreAttribute_(status);

      // line should appear clickable if there are delays/disruptions
      if (reason) {
        this.classList.add(cssClass.ACTIVE);
      } else {
        this.classList.remove(cssClass.ACTIVE);
      }

      // if there are multiple disruptions, we don't want to reset
      // the reason text content
      if (lineInfo.length <= 1) {
        this.reasonTitleEl_.textContent = "";
      }

      this.subStatusEl_.textContent = "";
      this.subStatusEl_.textContent += `${this.line_}`;
      this.reasonTitleEl_.textContent += ` ${status} ${pipe}`;
    });
  }

  /**
   * Updates DOM with every new line status.
   * @private
   * @param {string} status
   */
  setScoreAttribute_(status) {
    switch (status) {
    case delayTypes.NO_SERVICE:
      this.setAttribute("score", "6");
      break;
    case delayTypes.SERVICE_CLOSED:
      this.setAttribute("score", "6");
      break;
    case delayTypes.PART_CLOSURE:
      this.setAttribute("score", "5");
      break;
    case delayTypes.PLANNED_CLOSURE:
      this.setAttribute("score", "5");
      break;
    case delayTypes.PART_SUSPENDED:
      this.setAttribute("score", "4");
      break;
    case delayTypes.SEVERE_DELAYS:
      this.setAttribute("score", "3");
      break;
    case delayTypes.MINOR_DELAYS:
      this.setAttribute("score", "2");
      break;
    case delayTypes.SPECIAL_SERVICE:
      this.setAttribute("score", "2");
      break;
    case delayTypes.GOOD_SERVICE:
      this.setAttribute("score", "1");
      break;
    }
  }
}
