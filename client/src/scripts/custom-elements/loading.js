import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

const cssClass = {
  LOADING_ACTIVE: 'tube-status-loading--active',
  LOADING_LINE_ACTIVE: 'tube-status-loading--active-line',
  APP_HIDDEN: 'app-wrapper--hidden',
};

const cssSelector = {
  APP_WRAPPER: '.app-wrapper',
};

/**
 * Loading custom element.
 */
export default class Loading extends HTMLElement {
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.appWrapper_;

    /** @private {string} */
    this.line_ = this.parentElement.parentElement.getAttribute('line');
  }

  connectedCallback() {
    const isApp = this.hasAttribute('app');
    const action = isApp ? 'LOADING-APP' : 'LOADING';
    const callback = isApp ? this.handleLoadingApp_.bind(this) : this.handleLoading_.bind(this);
    this.appWrapper_ = document.querySelector(cssSelector.APP_WRAPPER);

    subscribeToStore({ callback, action });
  } 

  /**
   * Handles loading app logic. 
   * @private
   */
  handleLoadingApp_() {
    const { loadingState: { state } } = getStore();
    
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
  handleLoading_() {
    const { loadingState: { state, line } } = getStore();

    // proceed if this loading element matches the line 
    if (this.line_ !== line) return;

    if (state) {
      this.classList.add(cssClass.LOADING_LINE_ACTIVE); 
    } else {
      this.classList.remove(cssClass.LOADING_LINE_ACTIVE);
    }
  }
}
