import { store } from '../utils/client-store.js';
const { updateStore, subscribeToStore, getStore } = store;

/**
 * Modal custom element.
 */
export default class Modal extends HTMLElement {
  constructor() {
    super();

    this.appWrapper_ = document.querySelector('.app-wrapper');

    // setup click event listener
    document.addEventListener('line-click', this.toggleModal_.bind(this));
  }

  connectedCallback() {
  }

  /**
   * Gets the relevant line information from client store. 
   * @private
   * @param {string} line
   */
  populateModal_(line) {
    const { reason } = store.getStore().lineInformation[line];

    const caption = document.createElement('div');
    caption.classList.add('tube-status-modal__caption');
    caption.textContent = reason;

    this.render_(caption);
  }

  /**
   * Shows modal with line information releavnt to clicked line. 
   * @param {Object} e
   * @private
   */
  toggleModal_(e) {
    const isHidden = this.classList.contains('tube-status-modal--hidden');
    const line = e.detail.line;

    if (isHidden) {
      this.setAttribute('isHidden', 'false');

      this.classList.remove('tube-status-modal--hidden');
      this.classList.add('tube-status-modal--active');
      this.populateModal_(line);
    } else {
      this.setAttribute('isHidden', 'true');

      this.classList.remove('tube-status-modal--active');
      this.classList.add('tube-status-modal--hidden');
    }
  }

  /**
   * Renders inner modal content depending on use case. 
   * @param {Element} content
   * @private
   */
  render_(content) {
    this.appendChild(content);
  }
}
