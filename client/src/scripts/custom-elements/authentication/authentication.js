import {store} from "../../utils/client-store.js";
import {apiLogout} from "../../utils/api.js";
import {handleTabFocus, create} from "../../utils/helpers.js";
import {actions, customEvents} from "../../constants.js";
const {updateStore, subscribeToStore, getStore} = store;

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  GOOGLE_SIGN_IN_IMAGE: ".tube-status-authentication__image",
  SUBSCRRIPTIONS: ".tube-status-header__subscription ",
};

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  SIGN_OUT_BTN: "tube-status-authentication__btn",
  HIDDEN: "tube-status-hide",
  BTN: "tube-status-btn",
};

/** @const {number} */
const LOADING_DELAY_LOGOUT = 300;

// eslint-disable-next-line no-undef
const socket = io("http://localhost:4000/");

/**
 * Authentication custom element.
 */
export default class Authentication extends HTMLElement {
  /** Create authentication custom element. */
  constructor() {
    super();

    /** @private {string} */
    this.dest_ = this.getAttribute("dest");

    /** @private {string} */
    this.authPath_ = this.getAttribute("auth-path");

    /** @private {HTMLImageElement} */
    this.signInImageEl_ = this.querySelector(cssSelector.GOOGLE_SIGN_IN_IMAGE);

    /** @private {string} */
    this.token_ = localStorage.getItem("JWT");

    /** @private {boolean} */
    this.connectedCalled_ = false;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    if (this.connectedCalled_) return;

    subscribeToStore({
      callback: this.attemptAttrUpdate_.bind(this),
      action: actions.AUTHENTICATION,
    });

    // listeners
    this.addEventListener("keyup", this.handleKeyup_.bind(this));
    this.addEventListener("keypress", this.handleKeyPress_.bind(this));
    this.addEventListener("click", this.handleAuth_.bind(this));

    socket.on(
      customEvents.IO_LOGOUT_ACTION,
      (data) => this.handleLogoutAction_(data));

    this.handleJWT_();
    this.connectedCalled_ = true;
  }

  /**
   * Handler for a tab keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyup_(e) {
    e.stopImmediatePropagation();
    e.which === 9 && handleTabFocus(this);
  }

  /**
   * Handler for a enter keypress event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyPress_(e) {
    e.stopImmediatePropagation();
    e.which === 13 && this.handleAuth_(e);
  }

  /**
   * Verify existence of JWT and parse if present.
   * @private
   */
  handleJWT_() {
    // if token exists, login was successful
    if (this.token_) {
      const {photos, id} = JSON.parse(window.atob(this.token_.split(".")[1]));

      updateStore({
        action: actions.AUTHENTICATION,
        data: {signedIn: true, avatar: photos[0].value, id},
      });
    }
  }

  /**
   * Attempts authentication path attribute updates after authentication
   * @private
   */
  attemptAttrUpdate_() {
    const {userProfile: {signedIn}} = getStore();

    if (signedIn) {
      const signOutBtn = create("button", {
        copy: "Sign out",
        classname: [cssClass.SIGN_OUT_BTN, cssClass.BTN],
      });

      this.setAttribute("auth-path", "Sign out");
      this.signInImageEl_.classList.add(cssClass.HIDDEN);
      this.appendChild(signOutBtn);
    } else {
      const signOutBtn = this.querySelector(`.${cssClass.SIGN_OUT_BTN}`);

      this.setAttribute("auth-path", "Sign in");
      this.signInImageEl_.classList.remove(cssClass.HIDDEN);
      document.querySelector(
        cssSelector.SUBSCRRIPTIONS).classList.add(cssClass.HIDDEN);
      this.removeChild(signOutBtn);
    }

    this.authPath_ = this.getAttribute("auth-path");
  }

  /**
   * Handles Google authentication process.
   * @param {Event} e
   * @private
   */
  handleAuth_(e) {
    e.stopPropagation();

    this.authPath_ === "Sign in" ?
      this.handleSignIn_() :
      this.handleLogout_();
  }

  /**
   * Handles the user sign in process.
   * @private
   */
  handleSignIn_() {
    this.classList.add(cssClass.HIDDEN);

    updateStore({
      action: actions.LOADING_HEADER,
      data: {loadingState: {state: true, line: null}},
    });

    window.location.href = this.dest_;
  }

  /**
   * Handles logout event emitted from server web socket.
   * @param {object} data
   * @async
   * @private
   */
  async handleLogoutAction_(data) {
    const {userProfile: {id}} = getStore();

    if (id === data.id) {
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY_LOGOUT));

      localStorage.removeItem("JWT");
      updateStore({
        action: actions.AUTHENTICATION,
        data: {signedIn: false, avatar: null, id: null},
      });

      updateStore({
        action: actions.LOADING_HEADER,
        data: {loadingState: {state: false, line: null}},
      });

      updateStore({action: actions.RESET_APP});
    }
  }

  /**
   * Handles the user logout process.
   * @async
   * @private
   */
  async handleLogout_() {
    this.authPath_ = "Sign in";
    this.querySelector(
      `.${cssClass.SIGN_OUT_BTN}`).classList.add(cssClass.HIDDEN);

    updateStore({
      action: actions.LOADING_HEADER,
      data: {loadingState: {state: true, line: null}},
    });

    const result = await apiLogout();

    if (result !== 200) this.handleError_(result);
  }

  /**
   * Handles api fetch errors.
   * @param {object} e
   * @private
   */
  handleError_(e) {
    console.error(`Unable to subscribe to line at this time. ${e}`);

    updateStore({
      action: actions.LOADING_HEADER,
      data: {loadingState: {state: false, line: null}},
    });
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.handleAuth_);
    this.removeEventListener("keyup", this.handleKeyup_);
    this.removeEventListener("keypress", this.handleKeyPress_);
  }
}
