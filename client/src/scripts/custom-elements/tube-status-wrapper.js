import {store} from "../utils/client-store.js";
import {apiGetAllLineData, apiGetLineSubscriptions} from "../utils/api.js";
import {removeSubscriptionId, create} from "../utils/helpers.js";
import {actions, customEvents} from "../constants.js";
const {updateStore, getStore} = store;

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  TUBE_LINE: ".tube-line",
  MESSAGE_WRAPPER: ".tube-status-wrapper__message",
};

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  MESSAGE_WRAPPER: "tube-status-wrapper__message",
  FILTER: "tube-status-filter",
};

/** @type {number} */
const FETCH_INTERVAL = 60000;

/** @type {string} */
const MESSAGE_TEXT = "There are currently no subscriptions";

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
  /** Create tube status wrapper custom element. */
  constructor() {
    super();

    this.token_ = localStorage.getItem("JWT");
  }

  /**
   * Called every time element is inserted to DOM.
   */
  async connectedCallback() {
    await this.getAllLineData_();
    await this.getLineSubscriptions_();
    this.order_();

    document.dispatchEvent(new CustomEvent(customEvents.READY));
    console.log(getStore());

    updateStore({
      action: actions.LOADING_APP,
      data: {loadingState: {state: false, line: null}},
    });

    document.addEventListener(
      customEvents.FILTER_SUBSCRIPTIONS, this.filterView_.bind(this));
    // get data every 60 seconds
    // this.fetchInterval_();
  }

  /**
   * Orders tube line elements within DOM based on severity scores.
   * @private
   */
  order_() {
    const lines = Array.from(document.querySelectorAll(cssSelector.TUBE_LINE));
    const sorted = lines.sort((a, b) => {
      return +b.getAttribute("score") - +a.getAttribute("score");
    });

    Array.from(this.children).forEach((child) => {
      if (!child.classList.contains(cssClass.FILTER)) {
        this.removeChild(child);
      }
    });

    // insert sorted lines back into DOM
    sorted.forEach((line) => this.appendChild(line));
  }

  /**
   * Fetch users line subscriptions (if any).
   * @async
   * @private
   */
  async getLineSubscriptions_() {
    const {userProfile: {signedIn}} = getStore();

    if (signedIn) {
      const result = await apiGetLineSubscriptions();

      if (result.subscriptions) {
        updateStore({
          action: actions.LINE_SUBSCRIBE,
          data: {lineSubscriptions: removeSubscriptionId(result.subscriptions)},
        });
      } else {
        this.handleError_(result);
      }
    }
  }

  /**
   * Handles the fetching of all API tube data.
   * @return {Promise}
   * @private
   */
  async getAllLineData_() {
    updateStore({
      action: actions.LOADING_APP,
      data: {loadingState: {state: true, line: null}},
    });

    const result = await apiGetAllLineData();
    let lineInformation;

    if (Array.isArray(result)) {
      lineInformation = this.formatLineInformation_(result);
    } else {
      this.handleError_(result);
    }

    // update store with successful API response
    return updateStore({
      action: actions.LINES,
      data: {result, lineInformation},
    });
  }

  /**
   * Formats line information ready for store updates.
   * @param {object} lines
   * @return {object}
   * @private
   */
  formatLineInformation_(lines) {
    return lines.reduce((cache, line) => {
      line.lineStatuses.forEach((status) => {
        const {statusSeverityDescription, reason} = status;
        const id = line.id;
        const lineData = {
          status: statusSeverityDescription,
          reason: reason || null,
        };
        // if line already exists then we have multiple disruptions
        if (cache[id]) {
          cache[id].push(lineData);
        } else {
          cache[id] = [lineData];
        }
      });
      return cache;
    }, {});
  }

  /**
   * Sets up the API fetch interval process.
   * @private
   */
  fetchInterval_() {
    setInterval(async () => {
      await this.getAllLineData_();
      updateStore({
        action: actions.LOADING_APP,
        data: {loadingState: {state: false, line: null}},
      });
    }, FETCH_INTERVAL);
  }

  /**
   * Filters the view, depending on the toggle state.
   * @param {CustomEvent} e
   * @private
   */
  filterView_(e) {
    const {filter} = e.detail;
    const {lineSubscriptions} = getStore();
    const subscriptions = lineSubscriptions.map((sub) => sub.line);
    const tubeLineEls = this.querySelectorAll(cssSelector.TUBE_LINE);
    const messageEl = this.querySelector(cssSelector.MESSAGE_WRAPPER);

    if (filter) {
      tubeLineEls.forEach((line) => {
        if (!subscriptions.includes(line.getAttribute("line"))) {
          line.setAttribute("hidden", "");
        }
      });

      if (!subscriptions.length) this.renderMessage_();
    } else {
      tubeLineEls.forEach((line) => {
        if (line.hasAttribute("hidden")) line.removeAttribute("hidden");
      });

      // remove message (if it exists)
      if (messageEl) this.removeChild(messageEl);
    }
  }

  /**
   * Renders a message element informing the user there are no subscriptions.
   * @private
   */
  renderMessage_() {
    const messsageEl = create("div", {
      classname: cssClass.MESSAGE_WRAPPER,
      copy: MESSAGE_TEXT,
    });

    this.appendChild(messsageEl);
  }

  /**
   * Handles api fetch errors.
   * @param {object} e
   * @private
   */
  handleError_(e) {
    console.error(e);
    alert("Unable to retrieve API data.");
  }
}
