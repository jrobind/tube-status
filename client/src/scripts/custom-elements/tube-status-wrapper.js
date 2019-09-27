import { subscribeToStore, updateStore, getStore } from '../utils/store.js';
import { pushSubscriptionSetup } from '../utils/push.js';

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

    connectedCallback() {
        this.getAllLineData_().then(res => {
            this.handleJWT_();
            this.getLineSubscriptions_();
            pushSubscriptionSetup();
            updateStore('LOADING', { loadingState: { state: false, type: 'app' } });
        });
        // get data every 60 seconds
        // this.initialise_();
    }

    /**
     * Fetch users line subscriptions (if any).
     * @private
     */
    async getLineSubscriptions_() {
        if (getStore().userProfile.signedIn) {
            const fetchOptions = { 
                method: 'GET',
                headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('JWT')}`
                }
            };
            const subscriptionResults = await fetch('api/subscribe', fetchOptions).catch(this.handleError_);
            const deserialised = await subscriptionResults.json();

            updateStore('LINE-SUBSCRIPTION', { lineSubscriptions: deserialised.lines });
        }      
    }

    /**
     * Verify existence of JWT and parse if present.
     * @private
     */
    async handleJWT_() {
        // if token exists, login was successful
        if (this.token_) {
            const { photos, id } = JSON.parse(window.atob(this.token_.split('.')[1]));

            updateStore('AUTH', { signedIn: true, avatar: photos[0].value, id });
            document.getElementById('google-avatar').src = getStore().userProfile.avatar;
        }       
    }
    
    /**
     * Handles the fetching of all API tube data.
     * @private
     */
    async getAllLineData_() {
        updateStore('LOADING', { loadingState: { state: true, type: 'app' } });

        const lines = await fetch('api/lines').catch(this.handleError_);
        const deserialised = await lines.json();
        // update store with successful API response
        return updateStore('LINES', deserialised);
    }

    /**
     * Sets up the API fetch interval process.
     * @private
     */
    initialise_() {
        setInterval(() => {
            this.getAllLineData_().then(updateStore('LOADING', { loadingState: { state: false, type: 'app' } }));
        }, FETCH_INTERVAL);
    }

    /** @private */
    handleError_(e) {
        console.error(e);
        alert('Unable to retrieve API data.');
    }
}
