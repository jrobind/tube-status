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
        // fetch('/protected', {
        //     headers: { 'Authorization':  `Bearer ${localStorage.getItem('JWT'))}`}
        // }).then(res => console.log(res))
        subscribeToStore(this.attemptUpdate_.bind(this));
        this.render_();
        this.addEventListener('click', this.handleAuth_.bind(this));
    } 

    /**
     * Attempts attribute & authentication text updates after authentication
     * @private
     */
    attemptUpdate_() {
        const { signedIn, lines } = getStore().userProfile;

        if (!signedIn) return;

        if (this.authPath_ === 'login') {
            this.setAttribute('auth-path', 'logout')
        } else if (this.authPath_ === 'logout') {
            return;
        } else {
            // check if line subscription exists for current line
            lines.includes(this.line_) ? this.setAttribute('auth-path', 'unsubscribe') : this.setAttribute('auth-path', 'subscribe');
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
    handleSubscriptionRequest() {
        const { userProfile, pushSubscription } = getStore();

        if (userProfile.signedIn && pushSubscription) {
            fetch('api/subscribe',{ 
                method: 'POST',
                body: JSON.stringify({ pushSubscription, line: this.line_ }),
                headers: {
                    'content-type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('JWT')}`
                }
            })
            .then(res => {
                updateStore('LINE_SUBSCRIPTION', { lines: res.lines });
                console.log('REACHINg');
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
