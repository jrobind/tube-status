import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/**
 * Line subscription custom element.
 */
export default class Authentication extends HTMLElement {
    constructor() {
        super();

        /** @private {string} */
        this.dest_ = this.getAttribute('dest');  
        /** @private {string} */
        this.authStatus_ = this.getAttribute('auth-copy');         
    }

    connectedCallback() {
        this.addEventListener('click', this.handleAuth_.bind(this));
    } 

    /**
     * Handle authentication process with Google.
     * @private
     */
    handleAuth_() {
        switch(this.authStatus_) {
            case 'login':
                this.setAttribute('auth-copy', 'logout')
                window.location.href = this.dest_;
            case 'logout':
                localStorage.removeItem('JWT');
                updateStore('AUTH', { signedIn: false, displayName: null, email: null, avatar: null, id: null });
                window.location.href = '/';
            case 'line-auth':
                // post subscription
                fetch('/subscribe',{ 
                    method: 'POST',
                    body: JSON.stringify({ pushSubscription }),
                    headers: {
                        'content-type': 'application/json'
                    }
                })
        }
    }
}
