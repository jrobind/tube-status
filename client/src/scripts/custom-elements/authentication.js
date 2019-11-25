import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/** @type {number} */
const LOADING_DELAY = 500;
/** @type {string} */
const SIGN_IN_TEXT = 'sign-in to subscribe';
/** @type {string} */
const LOGIN_TEXT = 'Log in with Google';

/**
 * Authentication custom element.
 */
export default class Authentication extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    this.dest_ = this.getAttribute('dest');  

    /** @private {string} */
    this.authPath_ = this.getAttribute('auth-path');

    /** @private {string} */       
    this.authenticationText_ = this.authPath_ === 'subscribe' ? SIGN_IN_TEXT : LOGIN_TEXT;

    /** @private {string} */
    this.line_ = this.parentElement.parentElement.getAttribute('line');
  }

  connectedCallback() {
    subscribeToStore(this.attemptUpdate_.bind(this));
    this.addEventListener('click', this.handleAuth_.bind(this));
    this.render_();
  } 

  /**
   * Attempts attribute & authentication text updates after authentication
   * @private
   */
  attemptUpdate_() {
    const { userProfile: { signedIn }, lineSubscriptions } = getStore();

    if (!signedIn || this.authPath_ === 'logout') return;

    if (this.authPath_ === 'login') {
      this.setAttribute('auth-path', 'logout');
    } else {
      // check if line subscription exists for current line
      lineSubscriptions.includes(this.line_) ? this.setAttribute('auth-path', 'unsubscribe') : this.setAttribute('auth-path', 'subscribe');
    }

    this.authPath_ = this.getAttribute('auth-path');
    this.authenticationText_ = this.authPath_;

    this.render_();
  }

  /**
   * Handles Google authentication process.
   * @private
   */
  handleAuth_() {
    const { userProfile } = getStore();

    switch(this.authPath_) {
      case 'login':
        window.location.href = this.dest_;
        break;
      case 'logout':
        localStorage.removeItem('JWT');
        updateStore('AUTH', { signedIn: false, avatar: null, id: null });
        window.location.href = '/';
        break;
      case 'subscribe':
        userProfile.signedIn ? this.handleSubscriptionRequest() : window.location.href = this.dest_;
        break;
      case 'unsubscribe':
        userProfile.signedIn ? this.handleSubscriptionRequest('unsubscribe') : window.location.href = this.dest_;
        break;
    }
  }

    /**
   * Handles line subscription request. 
   * @private
   */
  async handleSubscriptionRequest(subType) {
    const { userProfile, pushSubscription, lineSubscriptions } = getStore();
    const method = !subType ? 'POST' : 'DELETE';
    const body = !subType ? JSON.stringify({ pushSubscription, line: this.line_ }) : JSON.stringify({ line: this.line_ });
    const options = {
      method,
      body,
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('JWT')}`
      }
    };
    // activate loading state
    updateStore('LOADING', { loadingState: { state: true, type: 'line', line: this.line_ } });

    if (userProfile.signedIn && pushSubscription) {
      const subscriptionResponse = await fetch('api/subscribe', options).catch(this.handleError_);
      const deserialised = await subscriptionResponse.json();
      // push new line subscription to stored array if subscribing, otherwise remove unsubscribed line
      !subType ? lineSubscriptions.push(deserialised.lines) : lineSubscriptions.splice(lineSubscriptions.indexOf(deserialised.lines), 1);

      // set a minimum loading wheel time
      await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));

      updateStore('LINE-SUBSCRIPTION', { lineSubscriptions });
      updateStore('LOADING', { loadingState: { state: false, type: null, line: null } }); 
    }
  }

  /**
   * Renders link authentication text. 
   * @private
   */
  render_() {
    this.innerHTML = this.authenticationText_;
  }

  /** @private */
  handleError_(e) {
    console.error(e);
    alert('Unable to subscribe to line at this time.');
  }
}
