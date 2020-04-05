import {store} from "../utils/client-store.js";
import {actions} from "../constants.js";
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
};

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  HEADER_AVATAR_WRAPPER: ".tube-status-header__avatar",
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
    this.avatarEl_ = this.querySelector(cssSelector.HEADER_AVATAR);

    /** @private {HTMLElement} */
    this.profileEl_ = this.querySelector(cssSelector.HEADER_PROFILE);

    /** @private {HTMLElement} */
    this.avatarWrapperEl_ = this.querySelector(
      cssSelector.HEADER_AVATAR_WRAPPER);
  }

  /**
   * Called every time element is inserted to DOM.
   */
  connectedCallback() {
    subscribeToStore({
      callback: this.updateAvatar_.bind(this),
      action: actions.AUTHENTICATION,
    });


    this.avatarWrapperEl_.addEventListener(
      "click", this.toggleDropdown_.bind(this));
    this.avatarWrapperEl_.addEventListener(
      "keyup", this.handleKeyup_.bind(this));
    this.avatarWrapperEl_.addEventListener(
      "keypress", this.handleKeyPress_.bind(this));

    this.updateAvatar_();
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
    const {userProfile: {signedIn, avatar}} = getStore();

    this.avatarEl_.src = (signedIn) ?
      avatar :
      AVATAR_IMG_PATH;
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
  }

  /**
   * Handles user data deletion request.
   * @private
   */
  handleDeleteRequest_() {
  }

  /**
   * Handles user data download request.
   * @private
   */
  handleDownloadRequest_() {
  }

  /**
   * Handles toggling of the avatar dropdown once a user is signed in.
   * @param {KeyboardEvent|Event} e
   * @private
   */
  toggleDropdown_(e) {
    const {target, target: {tagName}} = e;

    if (tagName === "BUTTON") {
      const downloadBtn = target.classList.contains(cssClass.DOWNLOAD);

      downloadBtn ?
        this.handleDownloadRequest_() :
        this.handleDeleteRequest_();

      return;
    }

    const {userProfile: {signedIn}} = getStore();
    const contentExists = this.querySelector(
      `.${cssClass.DOWNLOAD}`);

    if (signedIn) {
      if (contentExists) {
        this.removeContent_();
        return;
      }
      const downloadBtn = create("button", {
        classname: cssClass.DOWNLOAD,
        copy: "download data",
        event: {type: "keyup", fn: handleTabFocus},
        data: {name: "tabindex", value: "0"},
      });
      const deleteBtn = create("button", {
        classname: cssClass.DELETE,
        copy: "delete data",
        event: {type: "keyup", fn: handleTabFocus},
        data: {name: "tabindex", value: "0"},
      });

      this.avatarWrapperEl_.appendChild(downloadBtn);
      this.avatarWrapperEl_.appendChild(deleteBtn);

      this.avatarEl_.setAttribute("tabindex", "0");

      // set focus and focus trap for dropdown elements
      this.avatarWrapperEl_.focus();
      createFocusTrap(this.avatarWrapperEl_);
    }
  }
}
