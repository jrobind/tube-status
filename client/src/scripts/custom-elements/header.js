import {store} from "../utils/client-store.js";
import {actions} from "../constants.js";
import {apiDownload, apiRemoveAccount} from "../utils/api.js";
import {handleTabFocus, create, createFocusTrap} from "../utils/helpers.js";
const {subscribeToStore, getStore} = store;

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  HIDE: "tube-status-hide",
  DOWNLOAD: "tube-status-avatar__dropdown-download-btn",
  HEADER_AVATAR: "tube-status-header__avatar-image",
  DELETE: "tube-status-avatar__dropdown-delete-btn",
  HEADER_PROFILE_SIGNED_IN: "tube-status-header__profile--signed-in",
  BTN_WRAPPER: "tube-status-avatar__btn-block",
  TEMP_ANCHOR: "tube-status-temp-anchor",
  HEADER_OPEN: "tube-status-header--open",
  BTN: "tube-status-btn",
  BTN_DANGER: "tube-status-btn--danger",
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  HEADER_AVATAR_WRAPPER: ".tube-status-header__avatar",
  HEADER_AVATAR: ".tube-status-header__avatar-image",
  HEADER_PROFILE: ".tube-status-header__profile",
  AUTHENTICATION: ".tube-status-authentication",
  TOAST: ".tube-status-toast",
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
    this.avatarEl_ = this.querySelector(cssSelector.HEADER_AVATAR);

    /** @private {HTMLElement} */
    this.profileEl_ = this.querySelector(cssSelector.HEADER_PROFILE);

    /** @private {HTMLElement} */
    this.authenticationEl_ = this.querySelector(cssSelector.AUTHENTICATION);

    /** @private {HTMLElement} */
    this.avatarWrapperEl_ = this.querySelector(
      cssSelector.HEADER_AVATAR_WRAPPER);
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    subscribeToStore([
      {
        callback: this.updateAvatar_.bind(this),
        action: actions.AUTHENTICATION,
      },
      {
        callback: this.updateAvatar_.bind(this),
        action: actions.NOTIFICATIONS_FEATURE,
      },
      {
        callback: this.toggleDropdown_.bind(this),
        action: actions.RESET_APP,
      },
    ]);

    document.addEventListener(
      "click", this.toggleDropdown_.bind(this));
    this.avatarWrapperEl_.addEventListener(
      "keyup", this.handleKeyup_.bind(this));
    this.avatarWrapperEl_.addEventListener(
      "keypress", this.handleKeyPress_.bind(this));
  }

  /**
   * Handler for a tab keyup event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyup_(e) {
    e.stopImmediatePropagation();
    e.which === 9 && handleTabFocus(e.target);
  }

  /**
   * Handler for a enter keypress event.
   * @param {KeyboardEvent} e
   * @private
   */
  handleKeyPress_(e) {
    e.stopImmediatePropagation();

    if (e.target.tagName !== "BUTTON") {
      e.which === 13 && this.toggleDropdown_(e);
    }
  }

  /**
   * Updates avatar src attribute after login/logout.
   * @private
   */
  updateAvatar_() {
    const {userProfile: {signedIn, avatar}, notificationsFeature} = getStore();

    if (notificationsFeature) {
      this.profileEl_.classList.remove(cssClass.HIDE);

      this.avatarEl_.src = (signedIn) ?
        avatar :
        AVATAR_IMG_PATH;

      signedIn && this.profileEl_.classList.add(
        cssClass.HEADER_PROFILE_SIGNED_IN);
    }
  }

  /**
   * Removes existing markup from avatar dropdown.
   * @private
   */
  removeContent_() {
    const children = Array.from(this.avatarWrapperEl_.children);

    children.forEach((el) => {
      if (!el.classList.contains(cssClass.HEADER_AVATAR)) {
        this.avatarWrapperEl_.removeChild(el);
      }
    });

    this.avatarEl_.removeAttribute("tabindex");
    this.classList.remove(cssClass.HEADER_OPEN);
  }

  /**
   * Handles user account removal request.
   * @param {Event} e
   * @async
   * @private
   */
  async handleRemoveRequest_(e) {
    e.stopImmediatePropagation();

    const toastEl = /** @type {HTMLElement} */ (
      document.querySelector(cssSelector.TOAST));
    const result = await apiRemoveAccount();

    if (result === 200) {
      this.removeContent_();
      // sign out user after successful account deletion
      this.authenticationEl_.click();

      // show toast
      toastEl.setAttribute("delete", "");
    }
  }

  /**
   * Handles user data download request.
   * @param {Event} e
   * @async
   * @private
   */
  async handleDownloadRequest_(e) {
    e.stopImmediatePropagation();

    const btnWrapperEl = this.querySelector(`.${cssClass.BTN_WRAPPER}`);
    const result = await apiDownload().catch(this.handleError_);
    const blob = await result.blob().catch(this.handleError_);

    const url = window.URL.createObjectURL(blob);
    const anchorEl = create("a", {
      data: {name: "href", value: url},
      classname: cssClass.TEMP_ANCHOR,
    });

    anchorEl.style.display = "none";
    anchorEl.download = "data.txt";
    btnWrapperEl.appendChild(anchorEl);
    anchorEl.click();
    window.URL.revokeObjectURL(url);
    btnWrapperEl.removeChild(
      btnWrapperEl.querySelector(`.${cssClass.TEMP_ANCHOR}`));
  }

  /**
   * Handles toggling of the avatar dropdown once a user is signed in.
   * @param {KeyboardEvent|Event} e
   * @private
   */
  toggleDropdown_(e) {
    if (e) {
      const {target} = e;
      const tempAnchorEl = this.querySelector(`.${cssClass.TEMP_ANCHOR}`);
      const btnWrapperEl = this.querySelector(`.${cssClass.BTN_WRAPPER}`);
      const clickOutOfBounds =
        target !== tempAnchorEl && target !== btnWrapperEl;
      const isAvatar =
        target === this.avatarEl_ || target === this.avatarWrapperEl_;

      if (!isAvatar && clickOutOfBounds) {
        this.removeContent_();
        return;
      }

      if (!isAvatar && !clickOutOfBounds) {
        return;
      }
    }

    const {userProfile: {signedIn}} = getStore();
    const contentExists = this.querySelector(
      `.${cssClass.DOWNLOAD}`);

    if (signedIn) {
      if (contentExists) {
        this.removeContent_();
        return;
      }

      this.createDropdown_();
    } else {
      this.removeContent_();
      this.profileEl_.classList.remove(
        cssClass.HEADER_PROFILE_SIGNED_IN);
    }
  }

  /**
   * Create dropdown component.
   * @private
   */
  createDropdown_() {
    const btnWrapperEl = create("div", {classname: cssClass.BTN_WRAPPER});
    const downloadBtnEvents = [
      {type: "click", fn: this.handleDownloadRequest_.bind(this)},
      {type: "keyup", fn: handleTabFocus},
    ];
    const deleteBtnEvents = [
      {type: "click", fn: this.handleRemoveRequest_.bind(this)},
      {type: "keyup", fn: handleTabFocus},
    ];
    const downloadBtn = create("button", {
      classname: [cssClass.DOWNLOAD, cssClass.BTN],
      copy: "Download data",
      event: downloadBtnEvents,
      data: {name: "tabindex", value: "0"},
    });
    const deleteBtn = create("button", {
      classname: [cssClass.DELETE, cssClass.BTN, cssClass.BTN_DANGER],
      copy: "Delete account",
      event: deleteBtnEvents,
      data: {name: "tabindex", value: "0"},
    });

    btnWrapperEl.appendChild(downloadBtn);
    btnWrapperEl.appendChild(deleteBtn);
    this.avatarWrapperEl_.appendChild(btnWrapperEl);
    this.classList.add(cssClass.HEADER_OPEN);

    this.avatarEl_.setAttribute("tabindex", "0");

    // set focus and focus trap for dropdown elements
    this.avatarWrapperEl_.focus();
    createFocusTrap(this.avatarWrapperEl_);
  }

  /**
   * Handles api fetch errors.
   * @param {object} e
   * @private
   */
  handleError_(e) {
    console.error(`We are currently unable to handle this request. ${e}`);
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener("click", this.toggleDropdown_);
    this.avatarWrapperEl_.removeEventListener("keyup", this.handleKeyup_);
    this.avatarWrapperEl_.removeEventListener("keypress", this.handleKeyPress_);
  }
}
