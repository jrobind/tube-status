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
        this.authenticationText_ = this.authPath_ === 'lineAuth' ? 'sign-in to subscribe' : 'Log in with Google';
    }

    connectedCallback() {
        // fetch('/protected', {
        //     headers: { 'Authorization':  `Bearer ${localStorage.getItem('JWT'))}`}
        // }).then(res => console.log(res))
        subscribeToStore(this.attemptUpdate_.bind(this), this.handleSubscriptionRequest.bind(this));
        this.render_();
        this.addEventListener('click', this.handleAuth_.bind(this));
    } 

    /**
     * Attempts attribute & authentication text updates after authentication. 
     * @private
     */
    attemptUpdate_() {
        if (getStore().userProfile.signedIn) {
            if (this.authPath_ !== 'lineAuth') {
                this.setAttribute('auth-path', 'logout');
                this.authPath_ = this.getAttribute('auth-path');
            }
            this.authenticationText_ = this.authPath_ !== 'lineAuth' ? this.authPath_ : 'subscribe';
            this.render_();
        }
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
                updateStore('AUTH', { signedIn: false, displayName: null, email: null, avatar: null, id: null });
                window.location.href = '/';
                break;
            case 'lineAuth':
                userProfile.signedIn ? this.handleSubscriptionRequest() : window.location.href = this.dest_;
                break;
        }
    }

     /**
     * Handles line subscription request. 
     * @private
     */
    handleSubscriptionRequest() {
        const { userProfile, pushSubscription } = getStore();
        const line = this.parentElement.parentElement.getAttribute('line');

        if (userProfile.signedIn && pushSubscription) {
            fetch('api/subscribe',{ 
                method: 'POST',
                body: JSON.stringify({ pushSubscription, line }),
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('JWT')}`
                }
            });
        }
    }

    /**
     * Renders link authentication text. 
     * @private
     */
    render_() {
        this.innerHTML = this.authenticationText_;
    }
}
