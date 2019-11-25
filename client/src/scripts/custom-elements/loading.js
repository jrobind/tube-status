import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/**
 * Loading custom element.
 */
export default class Loading extends HTMLElement {
  constructor() {
    super();

    this.appWrapper_ = document.querySelector('.app-wrapper');
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
    const activeClass = isLoadingTypeApp ? 'tube-status-loading--active' : 'tube-status-loading--active-line';
    const isLoading = state;

    // exit if line loading context
    if (this.hasAttribute('base') && !isLoadingTypeApp) return;
    
    if (isLoading) {
      // app loading
      isLoadingTypeApp && this.appWrapper_.classList.add('app-wrapper--hidden');
      this.classList.remove('tube-status-loading--hidden');
      this.classList.add(activeClass);         
    } else {
      isLoadingTypeApp && this.appWrapper_.classList.remove('app-wrapper--hidden');
      this.classList.remove(activeClass);  
      this.classList.add('tube-status-loading--hidden');
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
