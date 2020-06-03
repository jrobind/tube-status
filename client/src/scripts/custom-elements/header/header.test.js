/* eslint-disable max-len */
import Header from "./header.js";
import {store} from "../../utils/client-store.js";
import {initialStore} from "../../utils/initial-store.js";
import * as helpers from "../../utils/helpers.js";
import {actions} from "../../constants.js";
const {updateStore} = store;

// spies
const spyHandleTabFocus = jest.spyOn(helpers, "handleTabFocus");
const spyToggleDropdown_ = jest.spyOn(Header.prototype, "toggleDropdown_");

window.customElements.define("tube-status-header", Header);

/**
 * Tests
 */
describe("Header element", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <tube-status-header class="tube-status-header tube-status-hide">
        <div class="tube-status-header__heading">
          <h1 class="tube-status-header__heading-title">Tube-status</h1>
        </div>
        <div class="tube-status-header__profile tube-status-hide">
          <tube-status-loading class="tube-status-loading tube-status-loading__header" header></tube-status-loading>
          <tube-status-authentication tabindex="0" class="tube-status-authentication" dest='/auth/google/callback' auth-path='Sign in'>
            <img alt="sign in with google" src="./images/google-sign-in.png" class="tube-status-authentication__image">
          </tube-status-authentication>
          <div class="tube-status-header__subscription tube-status-hide">
            <tube-status-subscriptions tabindex="0" class="tube-status-subscriptions">
              <img alt="subscription list icon" src="./images/subscriptions.svg" class="tube-status-subscriptions__img tube-status-subscriptions__img--default"> 
              <img alt="subscription list icon filled" src="./images/subscriptions-filled.svg" class=" tube-status-subscriptions__img tube-status-subscriptions__img-filled tube-status-hide"> 
            </tube-status-subscriptions>
          </div>
          <div class="tube-status-header__avatar" tabindex="0">
            <img alt="Google profile avatar" referrerPolicy="no-referrer" class="tube-status-header__avatar-image"> 
          </div>
        </div>
      </tube-status-header>`;

    updateStore({action: actions.RESET_STORE, data: initialStore});
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("Instantiates without error", () => {
    const headerElement = document.querySelector(".tube-status-header");

    expect(headerElement.nodeType).toBe(1);
  });

  it("Handles a keyup event", () => {
    const headerElement = document.querySelector(".tube-status-header");
    const event = new KeyboardEvent("keyup", {which: 9});
    const avatarWrapperElement = headerElement.avatarWrapperEl_;

    avatarWrapperElement.dispatchEvent(event);

    expect(spyHandleTabFocus).toHaveBeenCalledTimes(1);
    expect(spyHandleTabFocus).toHaveBeenCalledWith(avatarWrapperElement);
  });

  it("Handles a keypress event", () => {
    const headerElement = document.querySelector(".tube-status-header");
    const event = new KeyboardEvent("keypress", {which: 13});
    const avatarWrapperElement = headerElement.avatarWrapperEl_;

    avatarWrapperElement.dispatchEvent(event);

    expect(spyToggleDropdown_).toHaveBeenCalledTimes(1);
  });

  it("Updates the user's avatar image after sign in", () => {
    const headerElement = document.querySelector(".tube-status-header");

    updateStore({
      action: actions.AUTHENTICATION,
      data: {signedIn: true, avatar: "https://test-photo/", id: "217321693378495195842"},
    });

    updateStore({
      action: actions.NOTIFICATIONS_FEATURE,
      data: {notificationsFeature: true},
    });

    headerElement.updateAvatar_();

    expect(headerElement.profileEl_.classList.contains("tube-status-hide")).toBeFalsy();
    expect(headerElement.avatarEl_.src).toBe("https://test-photo/");
    expect(headerElement.profileEl_.classList.contains("tube-status-header__profile--signed-in")).toBeTruthy();
  });
});
