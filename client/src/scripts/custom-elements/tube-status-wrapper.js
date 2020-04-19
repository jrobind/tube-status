import {store} from "../utils/client-store.js";
import {initPushSubscription} from "../push-setup.js";
import {
  apiGetAllLineData,
  apiGetLineSubscriptions,
  apiGetPushSubscription,
  apiSetPushSubscription,
} from "../utils/api.js";
import {removeSubscriptionId, create} from "../utils/helpers.js";
import {actions, customEvents, copy} from "../constants.js";
const {updateStore, getStore, subscribeToStore} = store;

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

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
  /** Create tube status wrapper custom element. */
  constructor() {
    super();

    /** @private {HTMLElement} */
    this.noteEl = document.querySelector(cssSelector.NOTE);
  }

  /**
   * Called every time element is inserted to DOM.
   */
  async connectedCallback() {
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
    await this.getAllLineData_();
    await this.getLineSubscriptions_();

    if (getStore().userProfile.signedIn) this.handleMultipleSignIn_(pushResult);

    this.order_();
    this.appReady_();

    updateStore({
      action: actions.LOADING_APP,
      data: {loadingState: {state: false, line: null}},
    });

    // listeners
    document.addEventListener(
      customEvents.FILTER_SUBSCRIPTIONS, this.filterView_.bind(this));

    if ("safari" in window !== true) {
      const channel = new BroadcastChannel("sw-messages");

      channel.addEventListener(
        "message", this.handleNotificationRecieved_.bind(this));
    }

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
   * Hide note element.
   * @private
   */
  hideNote_() {
    this.noteEl.classList.add(cssClass.HIDDEN);
  }

  /**
   * Handles the case where a user has signed in on multiple devices.
   * @async
   * @param {object} pushSubscription
   * @private
   */
  async handleMultipleSignIn_(pushSubscription) {
    if (!pushSubscription) return;

    const {push} = await apiGetPushSubscription()
      .catch(this.handleError_);

    // if the push susbcription does not already exist we set it
    if (!Object.keys(push).length) {
      await apiSetPushSubscription(pushSubscription).catch(this.handleError_);
      return;
    }

    // if there is an endpoint diff we have a different device case
    if (push.endpoint !== pushSubscription.endpoint) {
      this.noteEl.textContent = copy.NOTE_SIGN_OUT;
      this.noteEl.classList.remove(cssClass.HIDDEN);

      updateStore({action: actions.DEVICE, data: true});
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
      updateStore({
        action: actions.LOADING_APP,
        data: {loadingState: {state: true, line: null}},
      });

      await this.getAllLineData_();

      updateStore({
        action: actions.LOADING_APP,
        data: {loadingState: {state: false, line: null}},
      });
    }, FETCH_INTERVAL);
  }

  /**
   * Fetches tube line data when a push notification has been recieved
   * within the client.
   * @param {Event} e
   * @private
   */
  async handleNotificationRecieved_(e) {
    const {data: {title}} = e;

    if (title === "push received") {
      updateStore({
        action: actions.LOADING_APP,
        data: {loadingState: {state: true, line: null}},
      });

      await this.getAllLineData_();

      updateStore({
        action: actions.LOADING_APP,
        data: {loadingState: {state: false, line: null}},
      });
    }
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
      this.noteEl.textContent = copy.NOTE_PUSH_API;
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
   * @param {object} e
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
