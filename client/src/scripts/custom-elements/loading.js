import {store} from "../utils/client-store.js";
import {actions} from "../constants.js";
const {subscribeToStore, getStore} = store;

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  LOADING_ACTIVE: "tube-status-loading--active",
  LOADING_LINE_ACTIVE: "tube-status-loading--active-line",
  LOADING_HEADER_ACTIVE: "tube-status-loading--active-header",
  LOADING_HEADER: "tube-status-loading__header",
  APP_HIDDEN: "app-wrapper--hidden",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  APP_WRAPPER: ".app-wrapper",
};

/**
 * Loading custom element.
 */
export default class Loading extends HTMLElement {
  /** Create loading custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.appWrapper_;

    /** @private {string} */
    this.line_ = this.parentElement.parentElement.getAttribute("line");

    /** @private {boolean} */
    this.connectedCalled_ = false;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    if (this.connectedCalled_) return;

    const isApp = this.hasAttribute("app");
    const isHeader = this.hasAttribute("header");
    let action;
    let callback;

    this.appWrapper_ = document.querySelector(cssSelector.APP_WRAPPER);

    if (isApp) {
      action = actions.LOADING_APP;
      callback = this.handleLoadingApp_.bind(this);
    } else if (isHeader) {
      action = actions.LOADING_HEADER;
      callback = this.handleLoadingHeader_.bind(this);
    } else {
      action = actions.LOADING_LINE;
      callback = this.handleLoadingLine_.bind(this);
    }

    subscribeToStore({callback, action});
    this.connectedCalled_ = true;
  }

  /**
   * Handles loading app logic.
   * @private
   */
  handleLoadingApp_() {
    const {loadingState: {state}} = getStore();

    if (state) {
      this.appWrapper_.classList.add(cssClass.APP_HIDDEN);
      this.classList.add(cssClass.LOADING_ACTIVE);
    } else {
      this.appWrapper_.classList.remove(cssClass.APP_HIDDEN);
      this.classList.remove(cssClass.LOADING_ACTIVE);
    }
  }

  /**
   * Handles loading line logic.
   * @private
   */
  handleLoadingLine_() {
    const {loadingState: {state, line}} = getStore();
    const classList = this.classList;

    if (this.line_ !== line) return;

    state ?
      classList.add(cssClass.LOADING_LINE_ACTIVE) :
      classList.remove(cssClass.LOADING_LINE_ACTIVE);
  }

  /**
   * Handles loading header logic.
   * @private
   */
  handleLoadingHeader_() {
    const {loadingState: {state}} = getStore();
    const classList = this.classList;

    state ?
      classList.add(cssClass.LOADING_HEADER_ACTIVE) :
      classList.remove(cssClass.LOADING_HEADER_ACTIVE);
  }
}
