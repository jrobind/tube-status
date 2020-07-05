import {store} from "../utils/client-store.js";
import {initPushSubscription} from "../push-setup.js";
import {
  apiGetAllLineData,
  apiGetLineSubscriptions,
  apiSetPushSubscription,
} from "../utils/api.js";
import {removeSubscriptionId, create} from "../utils/helpers.js";
import {actions, customEvents, copy} from "../constants.js";
const {updateStore, getStore, subscribeToStore} = store;
// eslint-disable-next-line no-undef
const socket = io("http://localhost:4000/");

/**
 * CSS class selectors.
 * @enum {string}
 */
const cssSelector = {
  TUBE_LINE: ".tube-line",
  SUB_ICON: ".tube-line-sub__image-wrapper",
  MESSAGE_WRAPPER: ".tube-status-wrapper__message",
  FOOTER: ".tube-status-footer",
  HEADER: ".tube-status-header",
  SUBSCRRIPTIONS: ".tube-status-header__subscription",
  AUTHENTICATION: ".tube-status-authentication",
  NOTE: ".tube-status-note",
  NOTE_MESSAGE: ".tube-status-note__message",
  PRIVACY_MODAL: "tube-status-privacy-modal",
};

/**
 * CSS classes.
 * @enum {string}
 */
const cssClass = {
  MESSAGE_WRAPPER: "tube-status-wrapper__message",
  FILTER: "tube-status-filter",
  HIDDEN: "tube-status-hide",
};

/** @type {number} */
const FETCH_INTERVAL = 90000;

/** @const {number} */
const LOADING_DELAY = 500;

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
  /** Create tube status wrapper custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.noteEl = document.querySelector(cssSelector.NOTE);

    /** @private {HTMLElement} */
    this.noteMessageEl = document.querySelector(cssSelector.NOTE_MESSAGE);
  }

  /**
   * Called every time element is inserted to DOM.
   */
  async connectedCallback() {
    const href = window.location.href;

    updateStore({
      action: actions.LOADING_APP,
      data: {loadingState: {state: true, line: null}},
    });

    subscribeToStore({
      callback: this.hideNote_.bind(this),
      action: actions.RESET_APP,
    });

    const pushResult = await initPushSubscription();

    await this.updateNotifcationFeatureFlag_(pushResult);
    await this.setPushSubscription_(pushResult);
    await this.getAllLineData_();
    await this.getLineSubscriptions_();

    this.order_();
    this.appReady_();

    updateStore({
      action: actions.LOADING_APP,
      data: {loadingState: {state: false, line: null}},
    });

    if (href.includes("privacy")) {
      document.querySelector(cssSelector.PRIVACY_MODAL).focus();
    }

    // listeners
    document.addEventListener(
      customEvents.FILTER_SUBSCRIPTIONS, this.filterView_.bind(this));
    document.addEventListener(
      "visibilitychange", this.handleVisibilityChange_.bind(this));

    socket.on(
      customEvents.IO_SUBSCRIPTION_ACTION,
      (data) => this.handleSubscriptionAction_(data));

    socket.on(customEvents.CONNECT, this.handleConnected_.bind(this));

    // get data every 60 seconds
    this.fetchInterval_();
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
   * Updates push subscription feature flag.
   * @param {!Object} pushSubscription
   * @async
   * @private
   */
  async updateNotifcationFeatureFlag_(pushSubscription) {
    const flag = pushSubscription ? true : false;

    updateStore({
      action: actions.NOTIFICATIONS_FEATURE,
      data: {notificationsFeature: flag},
    });
  }

  /**
   * Handles a successful socket connection.
   * @async
   * @private
   */
  async handleConnected_() {
    const {userProfile: {signedIn}} = getStore();

    if (signedIn) {
      await this.getLineSubscriptions_();
    }
  }

  /**
   * Hide note element.
   * @private
   */
  hideNote_() {
    this.noteEl.classList.add(cssClass.HIDDEN);
  }

  /**
   * Handles subscription event emitted from server web socket.
   * @param {object} data
   * @async
   * @private
   */
  async handleSubscriptionAction_(data) {
    const {userProfile: {id}} = getStore();

    if (id === data.id) {
      await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY));
      await this.getLineSubscriptions_();
    }
  }

  /**
   * Saves user push subscription object to db.
   * @async
   * @param {object} pushSubscription
   * @private
   */
  async setPushSubscription_(pushSubscription) {
    const {userProfile: {signedIn}} = getStore();

    if (signedIn) {
      const {push} = await apiSetPushSubscription(pushSubscription);

      if (!push.length) this.handleError_();
    }
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
    const result = await apiGetAllLineData();

    if (result) {
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
    } else {
      this.handleError_(result);
    }
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
      await this.getLineSubscriptions_();
      this.order_();
    }, FETCH_INTERVAL);
  }

  /**
   * Fetches tube line data when the document has become active.
   * @private
   */
  async handleVisibilityChange_() {
    if (document.visibilityState === "visible") {
      await this.getAllLineData_();
      this.order_();
    }
  }

  /**
   * Filters the view, depending on the toggle state.
   * @param {CustomEvent} e
   * @private
   */
  filterView_(e) {
    const {detail: {filter}} = e;
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
      copy: copy.NO_SUBSCRIPTIONS,
    });

    this.appendChild(messsageEl);
  }

  /**
   * Handles the app ready state.
   * @private
   */
  appReady_() {
    const {notificationsFeature, userProfile: {signedIn}} = getStore();
    const href = window.location.href;

    document.querySelector(
      cssSelector.FOOTER).classList.remove(cssClass.HIDDEN);
    document.querySelector(
      cssSelector.HEADER).classList.remove(cssClass.HIDDEN);

    if (signedIn) {
      const tubeLineSubEls = this.querySelectorAll(cssSelector.SUB_ICON);

      tubeLineSubEls.forEach((el) => el.classList.remove(cssClass.HIDDEN));
      document.querySelector(
        cssSelector.SUBSCRRIPTIONS).classList.remove(cssClass.HIDDEN);
    }

    if (!notificationsFeature) {
      this.noteMessageEl.textContent = copy.NOTE_PUSH_API;
      this.noteEl.classList.remove(cssClass.HIDDEN);
    }

    document.dispatchEvent(new CustomEvent(customEvents.READY));

    if (href.includes("privacy")) {
      document.dispatchEvent(new CustomEvent(customEvents.PRIVACY_POLICY));
    } else if (href.includes("pwa-installed")) {
      document.querySelector(cssSelector.AUTHENTICATION).click();
    }

    this.classList.remove(cssClass.HIDDEN);
  }

  /**
   * Handles api fetch errors.
   * @param {object=} e
   * @private
   */
  handleError_(e) {
    console.error(e);
    alert("Unable to retrieve API data.");
  }

  /**
   * Called each time custom element is disconnected from the DOM.
   * @private
   */
  disconnectedCallback() {
    document.removeEventListener(
      customEvents.FILTER_SUBSCRIPTIONS, this.filterView_);
  }
}
