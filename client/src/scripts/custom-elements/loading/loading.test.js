/* eslint-disable max-len */
import Loading from "./loading.js";
// import {store} from "../../utils/client-store.js";
// import * as helpers from "../../utils/helpers.js";
// import {initialStore} from "../../utils/initial-store.js";
// import {actions} from "../../constants.js";
// const {updateStore} = store;


window.customElements.define("tube-status-loading", Loading);

/**
 * Tests
 */
describe("Loading element", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <tube-status-loading class="tube-status-loading"></tube-status-loading>`;
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("Instantiates without error", () => {
    const loadingElement = document.querySelector(".tube-status-loading");

    expect(loadingElement.nodeType).toBe(1);
  });
});
