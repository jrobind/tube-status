/* eslint-disable max-len */
import Authentication from "./authentication.js";
import waitForExpect from "wait-for-expect";
import {store} from "../../utils/client-store.js";
import {apiLogout} from "../../utils/api.js";
import * as helpers from "../../utils/helpers.js";
import {initialStore} from "../../utils/initial-store.js";
import {actions} from "../../constants.js";
jest.mock("../../utils/api.js");
const {getStore, updateStore} = store;
const testJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIxNzMyMTY5MzM3ODQ5NTE5NTg0MiIsImRpc3BsYXlOYW1lIjoiSm9obiBEb2UiLCJuYW1lIjp7ImZhbWlseU5hbWUiOiJEb2UiLCJnaXZlbk5hbWUiOiJKb2huIn0sInBob3RvcyI6W3sidmFsdWUiOiJodHRwczovL3Rlc3QtcGhvdG8ifV0sInByb3ZpZGVyIjoiZ29vZ2xlIiwiX3JhdyI6IntcbiAgXCJzdWJcIjogXCIxMDczMjE2OTQ0Nzg0OTUxOTU4NDFcIixcbiAgXCJuYW1lXCI6IFwiSm9obiBEb2VcIixcbiAgXCJnaXZlbl9uYW1lXCI6IFwiSm9oblwiLFxuICBcImZhbWlseV9uYW1lXCI6IFwiRG9lXCIsXG4gIFwicGljdHVyZVwiOiBcImh0dHBzOi8vdGVzdC1waG90b1wiLFxuICBcImxvY2FsZVwiOiBcImVuLUdCXCJcbn0iLCJfanNvbiI6eyJzdWIiOiIyMTczMjE2OTMzNzg0OTUxOTU4NDIiLCJuYW1lIjoiSm9obiBEb2UiLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIiwicGljdHVyZSI6Imh0dHBzOi8vdGVzdC1waG90byIsImxvY2FsZSI6ImVuLUdCIn0sImlhdCI6MTU5MDQwOTgwMX0.5J68vM_RrnHo_6AgjhgjfFT6POQ2vwWzbIUDVDPqgwA";

// spies
const spyHandleJWT_ = jest.spyOn(Authentication.prototype, "handleJWT_");
const spyHandleAuth_ = jest.spyOn(Authentication.prototype, "handleAuth_");
const spyHandleError_ = jest.spyOn(Authentication.prototype, "handleError_").mockImplementation();
const spyHandleTabFocus = jest.spyOn(helpers, "handleTabFocus");

window.customElements.define("tube-status-authentication", Authentication);
localStorage.setItem("JWT", testJWT);

// jsdom does not handle manipulation of window.location so we need to handle this
delete window.location;
window.location = {
  replace: jest.fn(),
};

/**
 * Tests
 */
describe("Authentication element", () => {
  beforeAll(() => localStorage.setItem("JWT", testJWT));

  beforeEach(() => {
    document.body.innerHTML = `
      <tube-status-authentication tabindex="0" class="tube-status-authentication" dest='/auth/google/callback' auth-path='Sign in'>
        <img alt="sign in with google" src="./images/google-sign-in.png" class="tube-status-authentication__image">
      </tube-status-authentication>
      <div class="tube-status-header__subscription"></div>`;
  });

  afterEach(() => {
    spyHandleJWT_.mockClear();
    document.body.innerHTML = "";
    updateStore({action: actions.RESET_STORE, data: initialStore});
  });

  it("instantiates without error", () => {
    const authenticationElement = document.querySelector("tube-status-authentication");

    expect(authenticationElement.nodeType).toBe(1);
  });

  it("handles a JWT within local storage", () => {
    const authenticationElement = document.querySelector("tube-status-authentication");

    expect(authenticationElement.token_).toEqual(testJWT);
    expect(spyHandleJWT_).toHaveBeenCalledTimes(1);

    authenticationElement.handleJWT_();
    const {userProfile} = getStore();

    expect(userProfile.id).toBe("217321693378495195842");
    expect(userProfile.avatar).toBe("https://test-photo");
  });

  it("updates attributes after authentication", () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");

    expect(authenticationEl.getAttribute("auth-path")).toBe("Sign out");

    updateStore({
      action: actions.AUTHENTICATION,
      data: {signedIn: false, avatar: null, id: null},
    });

    expect(authenticationEl.getAttribute("auth-path")).toBe("Sign in");
  });

  it("handles a successful user login", () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");

    authenticationEl.handleSignIn_();

    expect(getStore().loadingState.state).toBeTruthy;
    expect(authenticationEl.classList.contains("tube-status-hide")).toBe(true);
  });

  it("handles an unsuccessful user logout proccess", async () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");
    apiLogout.mockImplementation(() => 500);

    authenticationEl.handleLogout_();

    await waitForExpect(() => {
      expect(spyHandleError_).toHaveBeenCalledTimes(1);
      expect(spyHandleError_).toHaveBeenCalledWith(500);
    });
  });

  it("handles a successful user logout process", async () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");
    apiLogout.mockImplementation(() => 200);

    authenticationEl.handleLogout_();

    await waitForExpect(() => {
      const signOutbtn = authenticationEl.querySelector(".tube-status-authentication__btn");

      expect(signOutbtn.classList.contains("tube-status-hide")).toBeTruthy();
      expect(getStore().loadingState.state).toBeTruthy();
      expect(authenticationEl.authPath_).toBe("Sign in");
    });
  });

  it("handles a logout action", async () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");

    authenticationEl.handleLogoutAction_({id: "217321693378495195842"});

    await waitForExpect(() => {
      expect(localStorage.getItem("JWT")).toBeNull();
      expect(getStore().loadingState.state).toBeFalsy();
      expect(getStore().userProfile.signedIn).toBeFalsy();
      expect(getStore().userProfile.avatar).toBeFalsy();
      expect(getStore().userProfile.id).toBeFalsy();
    });
  });

  it("handles a keyup event", () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");
    const event = new KeyboardEvent("keyup", {which: 9});

    authenticationEl.dispatchEvent(event);

    expect(spyHandleTabFocus).toHaveBeenCalledTimes(1);
    expect(spyHandleTabFocus).toHaveBeenCalledWith(authenticationEl);
  });

  it("handles a keypress event", () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");
    const event = new KeyboardEvent("keypress", {which: 13});

    authenticationEl.dispatchEvent(event);

    expect(spyHandleAuth_).toHaveBeenCalledTimes(1);
    expect(spyHandleAuth_).toHaveBeenCalledWith(event);
  });
});
