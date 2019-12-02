import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

const cssSelector = {
  HEADER_AUTHENTICATION: '.tube-status-header__authentication',
  HEADER_AVATAR: '.tube-status-header__avatar-image',
};

/** @const {string} */
const AVATAR_IMG_PATH = '/images/account_circle.svg';

/**
 * Header custom element.
 */
export default class Header extends HTMLElement {
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.avatarEl_;

     /** @private {HTMLElement} */
    this.authenticationEl_;
  }

  connectedCallback() {
    subscribeToStore({
      callback: this.updateAvatar_.bind(this),
      action: 'AUTH'
    });
    this.avatarEl_ = this.querySelector(cssSelector.HEADER_AVATAR);
    this.authenticationEl_ = this.querySelector(cssSelector.HEADER_AUTHENTICATION);
    this.updateAvatar_();
  }

  /**
   * Updates avatar src attribute after login/logout. 
   * @private
   */
  updateAvatar_() {
    const { userProfile: { signedIn, avatar } } = getStore();
    if (signedIn) {
      this.avatarEl_.src = avatar;
    } else {
      this.avatarEl_.src = AVATAR_IMG_PATH;
    }
  }

}
