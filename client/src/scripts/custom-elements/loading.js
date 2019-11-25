import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

const cssClass = {
  LOADING_ACTIVE: 'tube-status-loading--active',
  LOADING_LINE_ACTIVE: 'tube-status-loading--active-line',
  APP_HIDDEN: 'app-wrapper--hidden',
  LINE_HIDDEN: 'tube-status-loading--hidden',
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

    this.appWrapper_ = document.querySelector(cssSelector.APP_WRAPPER);
  }

  connectedCallback() {
    const { loadingState } = getStore();
  
    subscribeToStore(this.handleLoading_.bind(this));

    if (loadingState.type === 'line') {
      this.handleLoading_();
    }
  } 

  /**
   * Handles loading logic. 
   * @private
   */
  handleLoading_() {
    const { loadingState: { type,  state } } = getStore();
    const isLoadingTypeApp = type === 'app';
    const activeClass = isLoadingTypeApp ? cssClass.LOADING_ACTIVE : cssClass.LOADING_LINE_ACTIVE;
    const isLoading = state;

    // exit if line loading context
    if (this.hasAttribute('base') && !isLoadingTypeApp) return;
    
    if (isLoading) {
      // app loading
      isLoadingTypeApp && this.appWrapper_.classList.add(cssClass.APP_HIDDEN);
      this.classList.remove(cssClass.LINE_HIDDEN);
      this.classList.add(activeClass);         
    } else {
      isLoadingTypeApp && this.appWrapper_.classList.remove(cssClass.APP_HIDDEN);
      this.classList.remove(activeClass);  
      this.classList.add(cssClass.LINE_HIDDEN);
    }
  }

  /**
   * Renders link authentication text. 
   * @private
   */
  render_() {
    this.innerHTML = this.authenticationText_;
  }
}
