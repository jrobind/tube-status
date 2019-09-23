import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/**
 * Authentication custom element.
 */
export default class Authentication extends HTMLElement {
    constructor() {
        super();

        /** @private {string} */
        this.dest_ = this.getAttribute('dest');  
        /** @private {string} */
        this.authPath_ = this.getAttribute('auth-path');
        /** @private {string} */       
        this.authenticationText_ = this.authPath_ === 'subscribe' ? 'sign-in to subscribe' : 'Log in with Google';
        /** @private {string} */
        this.line_ = this.parentElement.parentElement.getAttribute('line');
    }

    connectedCallback() {
        subscribeToStore(this.attemptUpdate_.bind(this));
        this.addEventListener('click', this.handleAuth_.bind(this));
        this.render_();
    } 

    /**
     * Attempts attribute & authentication text updates after authentication
     * @private
     */
    attemptUpdate_() {
        const { userProfile: { signedIn }, lineSubscriptions } = getStore();

        if (!signedIn) return;

        if (this.authPath_ === 'login') {
            this.setAttribute('auth-path', 'logout')
        } else if (this.authPath_ === 'logout') {
            return;
        } else {
            // check if line subscription exists for current line
            lineSubscriptions.includes(this.line_) ? this.setAttribute('auth-path', 'unsubscribe') : this.setAttribute('auth-path', 'subscribe');
        }

        this.authPath_ = this.getAttribute('auth-path');
        this.authenticationText_ = this.authPath_;

        this.render_();
    }

    /**
     * Handle Google authentication process.
     * @private
     */
    handleAuth_() {
        const { userProfile } = getStore();

        switch(this.authPath_) {
            case 'login':
                window.location.href = this.dest_;
                break;
            case 'logout':
                localStorage.removeItem('JWT');
                updateStore('AUTH', { signedIn: false, avatar: null, id: null });
                window.location.href = '/';
                break;
            case 'subscribe':
                userProfile.signedIn ? this.handleSubscriptionRequest() : window.location.href = this.dest_;
                break;
            case 'unsubscribe':
                // invoke handleSubscriptionRequest, but unsubscibe
                break;
        }
    }

     /**
     * Handles line subscription request. 
     * @private
     */
    async handleSubscriptionRequest() {
        const { userProfile, pushSubscription, lineSubscriptions } = getStore();
        const fetchOptions = { 
            method: 'POST',
            body: JSON.stringify({ pushSubscription, line: this.line_ }),
            headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('JWT')}`
            }
        };
        // activate loading state
        updateStore('LOADING', { loadingState: { state: true, type: 'app'} });

        if (userProfile.signedIn && pushSubscription) {
            const subscriptionResponse = await fetch('api/subscribe', fetchOptions).catch(this.handleError_);
            const deserialised = await subscriptionResponse.json();
            // push new line subscription to stored array
            lineSubscriptions.push(deserialised.lines);

            // set a minimum loading wheel time
            await new Promise(resolve => setTimeout(resolve, 500));

            updateStore('LINE-SUBSCRIPTION', { lineSubscriptions });
            updateStore('LOADING', { loadingState: { state: false, type: 'app' } }); 
        }
    }

    /**
     * Renders link authentication text. 
     * @private
     */
    render_() {
        this.innerHTML = this.authenticationText_;
    }

    /** @private */
    handleError_(e) {
        console.error(e);
    }
}
