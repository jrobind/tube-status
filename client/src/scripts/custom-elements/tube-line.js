import { subscribeToStore, updateStore, getStore } from '../utils/store.js';
import Loading from './loading.js';

const cssClass = {
  STATUS_WRAPPER: 'tube-status-wrapper',
  SUB_STATUS: 'tube-line-sub__status',
  LINE_SUB: 'tube-line-sub',
  INFO_REASON_TITLE: 'tube-line-info__reason-title',
  INFO_REASON_CONTEXT: 'tube-line-info__reason-context',
  ACTIVE: 'tube-line--active',
};

const cssSelector = {
  STATUS_LOADING: 'tube-status-loading',
};

/**
 * Tube line custom element.
 */
export default class TubeLine extends HTMLElement {
  constructor() {
    super();

    /** @private {string} */
    this.line_ = this.getAttribute('line');

    /** @private {HTMLElement} */
    this.tubeStatusWrapper_;

    /** @private {HTMLElement} */
    this.subStatusEl_;

    /** @private {HTMLElement} */
    this.reasonTitleEl_;

    /** @private {HTMLElement} */
    this.reasonContextEl_;
  }

  connectedCallback() {
    subscribeToStore(this.updateDOM_.bind(this));

    this.tubeStatusWrapper_ = document.querySelector(`.${cssClass.STATUS_WRAPPER}`);
    this.subStatusEl_ = this.querySelector(`.${cssClass.SUB_STATUS}`);
    this.reasonTitleEl_ = this.querySelector(`.${cssClass.INFO_REASON_TITLE}`);
    this.reasonContextEl_ = this.querySelector(`.${cssClass.INFO_REASON_CONTEXT}`);
  }

  /**
   * Renders loading wheel to tube-line element.
   * @private
   */
  handleLoading_() {
    const { loadingState: { type, line, state } }  = getStore();
    const lineSubEl = this.querySelector(`.${cssClass.LINE_SUB}`);
    const subStatusEl = this.querySelector(`.${cssClass.SUB_STATUS}`);
    const statusLoadingEl = lineSubEl.querySelector(cssSelector.STATUS_LOADING);
    const loadingElement = new Loading();

    // remove loading element if it exists
    if (statusLoadingEl) lineSubEl.removeChild(statusLoadingEl);

    // return if loading state is false
    if (!state) return;

    if (type === 'line' && this.line_ === line) subStatusEl.insertAdjacentElement('afterend', loadingElement);
  }

  /**
   * Updates DOM with every new line status.
   * @private
   */
  updateDOM_() {
    const { status, reason } = getStore().lineInformation[this.line_];

    this.handleLoading_();

    // set score attribute on line so we can order with flexbox
    this.setScoreAttribute_(status);
    // line should appear clickable if there are delays/disruptions
    reason ? this.classList.add(cssClass.ACTIVE) : this.classList.remove(cssClass.ACTIVE);

    this.subStatusEl_.textContent = '';
    this.reasonTitleEl_.textContent = '';
    this.reasonContextEl_.textContent = '';

    // update line text content
    this.subStatusEl_.textContent = `${this.line_}`;
    this.reasonTitleEl_.textContent = status;
    // update reason if delays/disruption exists
    if (reason) this.reasonContextEl_.textContent = reason;
  }

  /**
   * Updates DOM with every new line status.
   * @private
   * @param {string} status 
   */ 
  setScoreAttribute_(status) {
    switch(status) {
      case 'No Service':
        this.setAttribute('score', 6);
        break;
      case 'Service Closed':
        this.setAttribute('score', 6);
        break;
      case 'Part Closure':
        this.setAttribute('score', 5);
        break;    
      case 'Planned Closure':
        this.setAttribute('score', 5);
        break;         
      case 'Part Suspended':
        this.setAttribute('score', 4);
        break;
      case 'Severe Delays':
        this.setAttribute('score', 3);
        break;
      case 'Minor Delays':
        this.setAttribute('score', 2);
        break;
      case 'Good Service':
        this.setAttribute('score', 1);
        break;
    }
  }
}
