import {store} from "../utils/client-store.js";
import {actions} from "../constants.js";
const {subscribeToStore, getStore} = store;

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  HIDE: "tube-status-hide",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  HEADER_AVATAR: ".tube-status-header__avatar-image",
  HEADER_PROFILE: ".tube-status-header__profile",
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

    /** @private {HTMLImageElement} */
    this.avatarEl_;

    /** @private {HTMLElement} */
    this.authenticationEl_;

    /** @private {HTMLElement} */
    this.profileEl_;
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    const subscribers = [
      {
        callback: this.showProfile_.bind(this),
        action: actions.NOTIFICATIONS_FEATURE,
      },
      {
        callback: this.updateAvatar_.bind(this),
        action: actions.AUTHENTICATION,
      },
    ];

    subscribeToStore(subscribers);

    this.avatarEl_ = this.querySelector(cssSelector.HEADER_AVATAR);
    this.profileEl_ = this.querySelector(cssSelector.HEADER_PROFILE);

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

  /**
   * Removes profile block.
   * @private
   */
  showProfile_() {
    const {notificationsFeature} = getStore();

    if (notificationsFeature) {
      this.profileEl_.classList.remove(cssClass.HIDE);
    }
  }
}
