import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

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
            const options = { 
                method: 'GET',
                headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('JWT')}`
                }
            };
            const subscriptionResults = await fetch('api/subscribe', options).catch(this.handleError_);
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
            const avatar = document.querySelector('.avatar__image');

            updateStore('AUTH', { signedIn: true, avatar: photos[0].value, id });
            avatar.src = getStore().userProfile.avatar;
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
        const lineInformation = this.formatLineInformation_(deserialised);
        // update store with successful API response  
        return updateStore('LINES', { deserialised, lineInformation });
    }

    /**
     * Formats line information ready for store updates.
     * @param {Object} lines
     * @private
     */
    formatLineInformation_(lines) {
        return lines.reduce((cache, line) => {
            const status = line.lineStatuses[0];
            cache[line.id] = { 
                status: status.statusSeverityDescription,
                reason: status.reason ? status.reason : null
             };
            return cache;
        }, {});
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
