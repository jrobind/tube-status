import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

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
        this.classList.add('tube-status-modal--hidden');
    }

    /**
     * Gets the relevant line information from client store. 
     * @private
     */
    handleLineInformation_() {

    }

    /**
     * Shows modal with line information releavnt to clicked line. 
     * @private
     */
    toggleModal_() {
        const isHidden = this.classList.contains('tube-status-modal--hidden');

        if (isHidden) {
            this.classList.remove('tube-status-modal--hidden');
            this.classList.add('tube-status-modal--active');
        } else {
            this.classList.remove('tube-status-modal--active');
            this.classList.add('tube-status-modal--hidden');
        }
    }
}
