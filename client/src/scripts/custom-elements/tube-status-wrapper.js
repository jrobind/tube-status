import { subscribeToStore, updateStore, getStore } from '../utils/store.js';
import { fetchAllLineStatus } from '../utils/api.js';

/** @type {number} */
const FETCH_INTERVAL = 30000;

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
    constructor() {
        super();

        /** @private {object} */
        this.results_ = null;
    }

    connectedCallback() {
        this.getAllLineData_();
        // get data every 30 seconds
        this.initialise_();

        fetch('/lines')
            .then(res => console.log(res, 'from server'))
    }
    
    /**
     * Handles the fetching of all API tube data.
     * @private
     */
    async getAllLineData_() {
        try {
            this.results_ = await fetchAllLineStatus();
            // update store with successful API response
            updateStore(this.results_);
        } catch(e) {
            this.handleError_(e);
        } 
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
