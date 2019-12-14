import {store} from "../utils/client-store.js";
import {apiGetAllLineData, apiGetLineSubscriptions} from "../utils/api.js";
const {updateStore, getStore} = store;

/** @type {number} */
const FETCH_INTERVAL = 60000;

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
  /** Create tube status wrapper custom element. */
  constructor() {
    super();

    this.token_ = localStorage.getItem("JWT");
  }

  /** Called every time element is inserted to DOM. */
  async connectedCallback() {
    await this.getAllLineData_();
    await this.getLineSubscriptions_();
    updateStore({
      action: "LOADING-APP",
      data: {loadingState: {state: false, line: null}},
    });
    console.log(getStore());
    // get data every 60 seconds
    // this.fetchInterval_();
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

      if (result.lines) {
        updateStore({
          action: "LINE-SUBSCRIPTION",
          data: {lineSubscriptions: result.lines},
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
      action: "LOADING-APP",
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
      action: "LINES",
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
      const status = line.lineStatuses[0];

      cache[line.id] = {
        status: status.statusSeverityDescription,
        reason: status.reason ? status.reason : null,
      };
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
        action: "LOADING-APP",
        data: {loadingState: {state: false, line: null}},
      });
    }, FETCH_INTERVAL);
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
