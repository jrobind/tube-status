/* eslint-disable max-len */
import Authentication from "./authentication.js";
import {store} from "../../utils/client-store.js";
import {initialStore} from "../../utils/initial-store.js";
import {actions} from "../../constants.js";
const {getStore, updateStore} = store;

const testJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIxNzMyMTY5MzM3ODQ5NTE5NTg0MiIsImRpc3BsYXlOYW1lIjoiSm9obiBEb2UiLCJuYW1lIjp7ImZhbWlseU5hbWUiOiJEb2UiLCJnaXZlbk5hbWUiOiJKb2huIn0sInBob3RvcyI6W3sidmFsdWUiOiJodHRwczovL3Rlc3QtcGhvdG8ifV0sInByb3ZpZGVyIjoiZ29vZ2xlIiwiX3JhdyI6IntcbiAgXCJzdWJcIjogXCIxMDczMjE2OTQ0Nzg0OTUxOTU4NDFcIixcbiAgXCJuYW1lXCI6IFwiSm9obiBEb2VcIixcbiAgXCJnaXZlbl9uYW1lXCI6IFwiSm9oblwiLFxuICBcImZhbWlseV9uYW1lXCI6IFwiRG9lXCIsXG4gIFwicGljdHVyZVwiOiBcImh0dHBzOi8vdGVzdC1waG90b1wiLFxuICBcImxvY2FsZVwiOiBcImVuLUdCXCJcbn0iLCJfanNvbiI6eyJzdWIiOiIyMTczMjE2OTMzNzg0OTUxOTU4NDIiLCJuYW1lIjoiSm9obiBEb2UiLCJnaXZlbl9uYW1lIjoiSm9obiIsImZhbWlseV9uYW1lIjoiRG9lIiwicGljdHVyZSI6Imh0dHBzOi8vdGVzdC1waG90byIsImxvY2FsZSI6ImVuLUdCIn0sImlhdCI6MTU5MDQwOTgwMX0.5J68vM_RrnHo_6AgjhgjfFT6POQ2vwWzbIUDVDPqgwA";

window.customElements.define("tube-status-authentication", Authentication);
localStorage.setItem("JWT", testJWT);

const spyHandleJWT_ = jest.spyOn(Authentication.prototype, "handleJWT_");

delete window.location;
window.location = {
  replace: jest.fn(),
};

/**
 * Tests
 */
describe("authentication element", () => {
  beforeAll(() => localStorage.setItem("JWT", testJWT));

  beforeEach(() => {
    document.body.innerHTML = `
      <tube-status-authentication tabindex="0" class="tube-status-authentication" dest='/auth/google/callback' auth-path='Sign in'>
        <img alt="sign in with google" src="./images/google-sign-in.png" class="tube-status-authentication__image">
      </tube-status-authentication>
      <div class="tube-status-header__subscription"></div>`;

    updateStore({action: actions.RESET_STORE, data: initialStore});
  });

  afterEach(() => {
    spyHandleJWT_.mockClear();
    document.body.innerHTML = "";
  });

  it("instantiates without error", () => {
    const authenticationElement = document.querySelector("tube-status-authentication");

    expect(authenticationElement.nodeType).toBe(1);
  });

  it("Handles a JWT within local storage", () => {
    const authenticationElement = document.querySelector("tube-status-authentication");

    expect(authenticationElement.token_).toEqual(testJWT);
    expect(spyHandleJWT_).toHaveBeenCalledTimes(1);

    authenticationElement.handleJWT_();
    const {userProfile} = getStore();

    expect(userProfile.id).toBe("217321693378495195842");
    expect(userProfile.avatar).toBe("https://test-photo");
  });

  it("Updates attributes after authentication", () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");

    expect(authenticationEl.getAttribute("auth-path")).toBe("Sign out");

    updateStore({
      action: actions.AUTHENTICATION,
      data: {signedIn: false, avatar: null, id: null},
    });

    expect(authenticationEl.getAttribute("auth-path")).toBe("Sign in");
  });

  it("Handles the user sign in process", () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");

    authenticationEl.handleSignIn_();

    expect(getStore().loadingState.state).toBeTruthy;
    expect(authenticationEl.classList.contains("tube-status-hide")).toBeTruthy;
  });
});
