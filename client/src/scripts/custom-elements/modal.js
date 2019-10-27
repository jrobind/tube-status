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
        this.setAttribute('toggle-state', 'false');
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
        const currentVal  = this.getAttribute('toggle-state');
        const newState = currentVal === 'false' ? 'true' : 'false';

        this.setAttribute('toggle-state', newState);
    }
}
