/* eslint-disable max-len */
import Header from "./header.js";
import {store} from "../../utils/client-store.js";
import {initialStore} from "../../utils/initial-store.js";
import {actions} from "../../constants.js";
const {updateStore} = store;

window.customElements.define("tube-status-filter", Header);

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
});
