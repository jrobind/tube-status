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
    }

    connectedCallback() {
        this.addEventListener('click', this.handleAuth_.bind(this));
    } 

    // attributeChangedCallback(attrName, oldVal, newVal) {
    //     if (attrName  === 'auth')
    // }

    /**
     * Handle Google authentication process.
     * @private
     */
    handleAuth_() {
        switch(this.authPath_) {
            case 'login':
                debugger;
                window.location.href = this.dest_;
                this.setAttribute('auth-path', 'logout');
                break;
            case 'logout':
                localStorage.removeItem('JWT');
                updateStore('AUTH', { signedIn: false, displayName: null, email: null, avatar: null, id: null });
                window.location.href = '/';
                this.setAttribute('auth-copy', 'login');
                break;
            case 'lineAuth':
                // post subscription
                fetch('/subscribe',{ 
                    method: 'POST',
                    body: JSON.stringify({ pushSubscription }),
                    headers: {
                        'content-type': 'application/json'
                    }
                });
        }
    }
}
