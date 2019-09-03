import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/** @type {number} */
const FETCH_INTERVAL = 30000;

/**
 * Tube status wrapper custom element.
 */
export default class TubeStatusWrapper extends HTMLElement {
    constructor() {
        super();

        this.addEventListener('fetch-start', this.handleLoading);
        this.addEventListener('fetch-end', this.handleLoading);
    }

    connectedCallback() {
        this.getAllLineData_().then(this.handleJWT_());
        // get data every 30 seconds
        // this.initialise_();
    }

    /**
     * Verify existence of JWT and parse if present.
     * @private
     */
    handleJWT_() {
        // dispath event to remove loading message
        this.dispatchEvent(new Event('fetch-end'));
        const token = localStorage.getItem('JWT');
        // if token exists, login was successful
        if (token) {
            // reset subscription copy
            [...document.querySelectorAll('.subscribe')].forEach(el => el.innerText = `subscribe`);
            // decode JWT profile data
            const { displayName, emails, photos, id } = JSON.parse(window.atob(token.split('.')[1]));
            updateStore('AUTH', { signedIn: true, displayName, email: emails[0].value, avatar: photos[0].value, id });
            // set avatar
            document.getElementById('google-avatar').src = getStore().userProfile.avatar;
        }       
    }
    
    /**
     * Handles the fetching of all API tube data.
     * @private
     */
    handleLoading(e) {
        const loadingEl = document.querySelector('.loading');

        if (e.type === 'fetch-start') {
            this.style.display = 'none';
            loadingEl.removeAttribute('hide');
            loadingEl.setAttribute('show', '');
        }  else {
            loadingEl.removeAttribute('show');
            loadingEl.setAttribute('hide', '');
            this.style.display = 'block';
        }
    }
    
    /**
     * Handles the fetching of all API tube data.
     * @private
     */
    async getAllLineData_() {
        // dispatch event to render loading message
        this.dispatchEvent(new Event('fetch-start'));
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
            this.getAllLineData_();
        }, FETCH_INTERVAL);
    }

    /** @private */
    handleError_(e) {
        console.error(e);
        alert('Unable to retrieve API data.');
    }
}
