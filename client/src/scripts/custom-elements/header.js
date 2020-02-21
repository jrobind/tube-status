import {store} from "../utils/client-store.js";
import {actions} from "../constants.js";
const {subscribeToStore, getStore} = store;

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  HEADER_AUTHENTICATION: ".tube-status-header__authentication",
  HEADER_AVATAR: ".tube-status-header__avatar-image",
};

/** @const {string} */
const AVATAR_IMG_PATH = "/images/account_circle.svg";

/**
 * Header custom element.
 */
export default class Header extends HTMLElement {
  /** Create header custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.avatarEl_;

    /** @private {HTMLElement} */
    this.authenticationEl_;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    subscribeToStore({
      callback: this.updateAvatar_.bind(this),
      action: actions.AUTHENTICATION,
    });
    this.avatarEl_ = /** @type {HTMLImageElement} */ (
      this.querySelector(cssSelector.HEADER_AVATAR));
    this.authenticationEl_ = this.querySelector(
      cssSelector.HEADER_AUTHENTICATION);
    this.updateAvatar_();
  }

  /**
   * Updates avatar src attribute after login/logout.
   * @private
   */
  updateAvatar_() {
    const {userProfile: {signedIn, avatar}} = getStore();

    this.avatarEl_.src = (signedIn) ?
      avatar :
      AVATAR_IMG_PATH;
  }
}
