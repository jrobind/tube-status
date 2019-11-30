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
 * Header custom element.
 */
export default class Header extends HTMLElement {
  constructor() {
    super();

  }

  connectedCallback() {
  
  }

  /**
   * Renders link authentication text. 
   * @private
   */
  render_() {
    this.innerHTML = this.authenticationText_;
  }
}
