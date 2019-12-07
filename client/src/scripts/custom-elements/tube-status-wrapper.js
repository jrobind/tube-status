import { store } from '../utils/client-store.js';
const { updateStore, subscribeToStore, getStore } = store;

/** @type {number} */
const FETCH_INTERVAL = 60000;

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
  constructor() {
    super();

    this.token_ = localStorage.getItem('JWT');
  }

  async connectedCallback() {
    await this.getAllLineData_();
    await this.getLineSubscriptions_();
    updateStore({
      action: 'LOADING-APP',
      data: { loadingState: { state: false, line: null } }
    });
    console.log(getStore())
    // get data every 60 seconds
    // this.fetchInterval_();
  }

  /**
   * Fetch users line subscriptions (if any).
   * @private
   */
  async getLineSubscriptions_() {
    const { userProfile: { signedIn } } = getStore();

    if (signedIn) {
      const options = { 
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      };
      const subscriptionResults = await fetch('api/subscribe', options).catch(this.handleError_);
      const deserialised = await subscriptionResults.json();

      updateStore({
        action: 'LINE-SUBSCRIPTION',
        data: { lineSubscriptions: deserialised.lines }
      });
    }      
  }
  
  /**
   * Handles the fetching of all API tube data.
   * @returns {object}
   * @private
   */
  async getAllLineData_() {
    updateStore({
      action: 'LOADING-APP',
      data: { loadingState: { state: true, line: null } }
    });

    const lines = await fetch('api/lines').catch(this.handleError_);
    const deserialised = await lines.json();
    console.log(deserialised);
    const lineInformation = this.formatLineInformation_(deserialised);
    // update store with successful API response  
    return updateStore({
      action: 'LINES',
      data: { deserialised, lineInformation }
    });
  }

  /**
   * Formats line information ready for store updates.
   * @param {object} lines
   * @returns {object}
   * @private
   */
  formatLineInformation_(lines) {
    return lines.reduce((cache, line) => {
      const status = line.lineStatuses[0];
      cache[line.id] = { 
        status: status.statusSeverityDescription,
        reason: status.reason ? status.reason : null
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
        action: 'LOADING-APP',
        data: { loadingState: { state: false, line: null } }
      });
    }, FETCH_INTERVAL);
  }

  /**
   * Formats line information ready for store updates.
   * @param {object} e
   * @private
   */
  handleError_(e) {
    console.error(e);
    alert('Unable to retrieve API data.');
  }
}
