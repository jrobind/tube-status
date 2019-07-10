import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/**
 * Line subscription custom element.
 */
export default class LineSubscription extends HTMLElement {
    constructor() {
        super();

        /** @private {string} */
        this.line_ = this.getAttribute('line');
    }

    connectedCallback() {
        subscribeToStore([subscribe_]);
        // get data every 30 seconds
        this.initialise_();
    }

    /**
     * Sets current line status data for custom element.
     * @private
     */
    subscribe_() {

    }
}
