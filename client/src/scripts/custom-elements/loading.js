import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/**
 * Loading custom element.
 */
export default class Loading extends HTMLElement {
    constructor() {
        super();

        this.appWrapper_ = document.querySelector('.app-wrapper');
    }

    connectedCallback() {
        subscribeToStore(this.handleLoading_.bind(this));
    } 

    /**
     * Handles loading logic. 
     * @private
     */
    handleLoading_() {
        const { loadingState } = getStore();
        if (loadingState.type === 'app') {
            // app loading
            if (loadingState.state) {
                this.appWrapper_.setAttribute('hide', '');
                this.removeAttribute('hide');
                this.setAttribute('show', '');          
            } else {
                this.appWrapper_.removeAttribute('hide');
                this.removeAttribute('show');
                this.setAttribute('hide', '');
            }
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
