import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

const CSS_CLASS= {
  STATUS_WRAPPER: 'tube-status-wrapper',
  SUB_STATUS: 'tube-line-sub__status',
  INFO_REASON_TITLE: 'tube-line-info__reason-title',
  INFO_REASON_CONTEXT: 'tube-line-info__reason-context',
  ACTIVE: 'tube-line--active'
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

    // listen for clicks so we can fire our own click event
    this.addEventListener('click', this.handleClick_.bind(this));
  }

  connectedCallback() {
    // subscription order matters. DOM updates depend on the processing of line status.
    subscribeToStore(this.updateDOM_.bind(this));

    this.tubeStatusWrapper_ = document.querySelector(`.${CSS_CLASS.STATUS_WRAPPER}`);
    this.subStatusEl_ = this.querySelector(`.${CSS_CLASS.SUB_STATUS}`);
    this.reasonTitleEl_ = this.querySelector(`.${CSS_CLASS.INFO_REASON_TITLE}`);
    this.reasonContextEl_ = this.querySelector(`.${CSS_CLASS.INFO_REASON_CONTEXT}`);
  }

  /**
   * Emits custom click event for modal custom element.
   * @param {object} e
   * @private
   */
  handleClick_(e) {

  }

  /**
   * Updates DOM with every new line status.
   * @private
   */
  updateDOM_() {
    const { status, reason } = getStore().lineInformation[this.line_];

    // set score attribute on line so we can order with flexbox
    this.setScoreAttribute_(status);
    // line should appear clickable if there are delays/disruptions
    reason ? this.classList.add(CSS_CLASS.ACTIVE) : this.classList.remove(CSS_CLASS.ACTIVE);

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
