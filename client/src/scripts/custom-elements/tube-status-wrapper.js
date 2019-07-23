import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/** @type {number} */
const FETCH_INTERVAL = 30000;

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.getAllLineData_();
        // get data every 30 seconds
        this.initialise_();
    }
    
    /**
     * Handles the fetching of all API tube data.
     * @private
     */
    async getAllLineData_() {
        const lines = await fetch('/lines').catch(this.handleError_);
        const deserialised = await lines.json();
        // update store with successful API response
        updateStore(deserialised);
        return deserialised;
    }

    /**
     * Sets up the API fetch interval process.
     * @private
     */
    initialise_() {
        setInterval(() => {
            this.getAllLineData_();
        }, FETCH_INTERVAL);
    }

    /** @private */
    handleError_(e) {
        console.error(e);
        alert('Unable to retrieve API data.');
    }
}
