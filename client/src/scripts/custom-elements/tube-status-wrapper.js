import { subscribeToStore, updateStore, getStore } from '../utils/store.js';
import { pushSubscriptionSetup } from '../utils/push.js';

/** @type {number} */
const FETCH_INTERVAL = 30000;

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
    constructor() {
        super();

        this.token_ = localStorage.getItem('JWT');
    }

    connectedCallback() {
        this.getAllLineData_().then(res => {
            this.handleJWT_();
            pushSubscriptionSetup();
            updateStore('LOADING', { loadingState: false });
        });
        // get data every 30 seconds
        // this.initialise_();
    }

    /**
     * Verify existence of JWT and parse if present.
     * @private
     */
    handleJWT_() {
        // if token exists, login was successful
        if (this.token_) {
            const { photos, id, lines } = JSON.parse(window.atob(this.token_.split('.')[1]));

            updateStore('AUTH', { signedIn: true, avatar: photos[0].value, id, lines });
            document.getElementById('google-avatar').src = getStore().userProfile.avatar;
        }       
    }
    
    /**
     * Handles the fetching of all API tube data.
     * @private
     */
    async getAllLineData_() {
        updateStore('LOADING', { loadingState: true });

        const lines = await fetch('api/lines').catch(this.handleError_);
        const deserialised = await lines.json();
        // update store with successful API response
        console.log(deserialised)
        return updateStore('LINES', deserialised);
    }

    /**
     * Sets up the API fetch interval process.
     * @private
     */
    initialise_() {
        setInterval(() => {
            this.getAllLineData_().then(updateStore('LOADING', { loadingState: false }))
        }, FETCH_INTERVAL);
    }

    /** @private */
    handleError_(e) {
        console.error(e);
        alert('Unable to retrieve API data.');
    }
}
