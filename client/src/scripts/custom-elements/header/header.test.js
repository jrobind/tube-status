/* eslint-disable max-len */
import Header from "./header.js";
import {store} from "../../utils/client-store.js";
import waitForExpect from "wait-for-expect";
import {apiDownload, apiRemoveAccount} from "../../utils/api.js";
import {initialStore} from "../../utils/initial-store.js";
import * as helpers from "../../utils/helpers.js";
import {actions} from "../../constants.js";
jest.mock("../../utils/api.js");
const {updateStore} = store;

// spies
const spyHandleTabFocus = jest.spyOn(helpers, "handleTabFocus");
const spyToggleDropdown_ = jest.spyOn(Header.prototype, "toggleDropdown_");
const spyRemoveContent_ = jest.spyOn(Header.prototype, "removeContent_");

window.customElements.define("tube-status-header", Header);

global.URL.createObjectURL = jest.fn(() => "https://tube-status.co.uk/");
global.URL.revokeObjectURL = jest.fn();

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
          <tube-status-authentication tabindex="0" class="tube-status-authentication" dest='/auth/google/callback' auth-path='Sign in'>
            <input tabindex="-1" type="image" src="./images/google-sign-in.png" alt="sign in with google" class="tube-status-authentication__image"/>
          </tube-status-authentication>
          <div class="tube-status-header__avatar" tabindex="0">
            <img alt="Google profile avatar" referrerPolicy="no-referrer" class="tube-status-header__avatar-image"> 
          </div>
        </div>
      </tube-status-header>
      <tube-status-toast class="tube-status-toast tube-status-hide"><span class="tube-status-toast__message"></span></tube-status-toast>`;
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
    updateStore({action: actions.RESET_STORE, data: initialStore});
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

  it("Removes existing markup from avatar dropdown", () => {
    const headerElement = document.querySelector(".tube-status-header");

    headerElement.createDropdown_();
    headerElement.removeContent_();

    expect(headerElement.avatarWrapperEl_.children.length).toBe(1);
    expect(headerElement.classList.contains("tube-status-header--open")).toBeFalsy();
    expect(headerElement.avatarEl_.hasAttribute("tabindex")).toBeFalsy();
  });

  it("Creates a dropdown component", () => {
    const headerElement = document.querySelector(".tube-status-header");

    headerElement.createDropdown_();

    expect(headerElement.avatarWrapperEl_.children.length).toBe(2);
    expect(headerElement.classList.contains("tube-status-header--open")).toBeTruthy();
    expect(headerElement.avatarEl_.hasAttribute("tabindex")).toBeTruthy();
  });

  it("Handles a user account removal request", async () => {
    const headerElement = document.querySelector(".tube-status-header");
    const toasterElement = document.querySelector(".tube-status-toast");

    apiRemoveAccount.mockImplementation(() => 200);

    headerElement.createDropdown_();
    headerElement.querySelector(".tube-status-btn--danger").click();

    await waitForExpect(() => {
      expect(headerElement.avatarWrapperEl_.children.length).toBe(1);
      expect(toasterElement.hasAttribute("delete")).toBeTruthy();
    });
  });

  it("Handles user data download request", async () => {
    const headerElement = document.querySelector(".tube-status-header");

    apiDownload.mockReturnValue(Promise.resolve({
      blob() {
        return Promise.resolve("https://tube-status.co.uk/");
      },
    }));

    headerElement.createDropdown_();
    headerElement.querySelector(".tube-status-btn").click();

    await waitForExpect(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(window.URL.createObjectURL).toHaveBeenCalledWith("https://tube-status.co.uk/");
      expect(window.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("https://tube-status.co.uk/");
    });
  });

  it("toggles the header dropdown", () => {
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

    headerElement.toggleDropdown_({target: headerElement.avatarEl_});

    expect(headerElement.avatarWrapperEl_.children.length).toBe(2);
    expect(spyRemoveContent_).toHaveBeenCalledTimes(0);

    headerElement.toggleDropdown_({target: document});

    expect(spyRemoveContent_).toHaveBeenCalledTimes(1);
    expect(headerElement.avatarWrapperEl_.children.length).toBe(1);
  });
});
