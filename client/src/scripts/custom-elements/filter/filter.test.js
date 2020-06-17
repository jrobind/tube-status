/* eslint-disable max-len */
import Filter from "./filter.js";
import {store} from "../../utils/client-store.js";
import * as helpers from "../../utils/helpers.js";
import {initialStore} from "../../utils/initial-store.js";
import {actions} from "../../constants.js";
const {updateStore} = store;

// spies
const spyEmit_ = jest.spyOn(Filter.prototype, "emit_");
const spyToggleIcon_ = jest.spyOn(Filter.prototype, "toggleIcon_");
const spyHandleTabFocus = jest.spyOn(helpers, "handleTabFocus");
const spyDispatchEvent = jest.spyOn(document, "dispatchEvent").mockImplementation((e) => e.detail.filter);

window.customElements.define("tube-status-filter", Filter);

/**
 * Tests
 */
describe("Filter element", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <tube-status-filter class="tube-status-filter">
        <span class="tube-status-filter__description"></span>
        <div tabindex="0" class="tube-status__filter-toggle">
          <img alt="toggle icon off" src="./images/toggle-off.svg" class="tube-status__filter-toggle--off tube-status__filter-toggle-image">
          <img alt="toggle icon on" src="./images/toggle-on.svg" class="tube-status-hide tube-status__filter-toggle--on tube-status__filter-toggle-image">
        </div>
      </tube-status-filter>`;

    updateStore({action: actions.RESET_STORE, data: initialStore});
  });

  afterEach(() => {
    spyEmit_.mockClear();
    spyDispatchEvent.mockClear();
    spyToggleIcon_.mockClear();
    document.body.innerHTML = "";
  });

  it("instantiates without error", () => {
    const filterElement = document.querySelector(".tube-status-filter");

    expect(filterElement.nodeType).toBe(1);
  });

  it("handles a keyup event", () => {
    const filterElement = document.querySelector(".tube-status-filter");
    const event = new KeyboardEvent("keyup", {which: 9});

    filterElement.dispatchEvent(event);

    expect(spyHandleTabFocus).toHaveBeenCalledTimes(1);
    expect(spyHandleTabFocus).toHaveBeenCalledWith(filterElement.filterToggle_);
  });

  it("handles a keypress event", () => {
    const filterElement = document.querySelector("tube-status-filter");
    const event = new KeyboardEvent("keypress", {which: 13});

    filterElement.dispatchEvent(event);

    expect(spyToggleIcon_).toHaveBeenCalledTimes(1);
    expect(spyEmit_).toHaveBeenCalledTimes(1);
  });

  it("handles a click event", () => {
    const filterElement = document.querySelector("tube-status-filter");

    filterElement.toggleIconEls_[0].click();

    expect(spyToggleIcon_).toHaveBeenCalledTimes(1);
    expect(spyEmit_).toHaveBeenCalledTimes(1);
  });

  it("toggles the visibility of the filter element", () => {
    const filterElement = document.querySelector("tube-status-filter");

    filterElement.toggleDisplay_();
    // element should be hidden if the user is not logged in
    expect(filterElement.classList.contains("tube-status-filter--active")).toBeFalsy();

    updateStore({
      action: actions.AUTHENTICATION,
      data: {signedIn: true, avatar: null, id: null},
    });

    expect(filterElement.classList.contains("tube-status-filter--active")).toBeTruthy();
  });

  it("successfully emits a custom event with a truthy filter", () => {
    const filterElement = document.querySelector("tube-status-filter");

    filterElement.emit_();

    expect(spyDispatchEvent).toHaveBeenCalled();
    expect(spyDispatchEvent).toHaveReturnedWith(true);
  });

  it("successfully emits a custom event with a falsy filter", () => {
    const filterElement = document.querySelector("tube-status-filter");

    filterElement.emit_(true);

    expect(spyDispatchEvent).toHaveBeenCalled();
    expect(spyDispatchEvent).toHaveReturnedWith(false);
  });
});
