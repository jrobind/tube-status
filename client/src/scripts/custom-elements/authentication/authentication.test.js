/* eslint-disable max-len */
import Authentication from "./authentication.js";
const markup = document.createElement("div");

window.customElements.define("tube-status-authentication", Authentication);

const authenticationInstance = new Authentication();

markup.innerHTML = `<tube-status-authentication tabindex="0" class="tube-status-authentication" dest='/auth/google/callback' auth-path='Sign in'>
<img alt="sign in with google" src="./images/google-sign-in.png" class="tube-status-authentication__image">
</tube-status-authentication>`;

document.body.appendChild(markup);

/**
 * Tests
 */
describe("authentication element", () => {
  afterEach(() => document.body.innerHTML = "");

  it("renders without error", () => {
    const authenticationEl = document.querySelector(".tube-status-authentication");

    expect(authenticationEl).toBeTruthy();
  });

  it("Check it instantiates without error", () => {
    expect(authenticationInstance.nodeType).toBe(1);
  });
});
