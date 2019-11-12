import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

/**
 * Tube line custom element.
 */
export default class TubeLine extends HTMLElement {
    constructor() {
        super();

        /** @private {string} */
        this.line_ = this.getAttribute('line');
        /** @private {HTMLElement} */
        this.tubeStatusWrapper_ = null;
        /** @private {object} */
        this.lineStatus_ = null;
        // listen for clicks so we can fire our own click event
        this.addEventListener('click', this.emitEvent_.bind(this));
    }

    connectedCallback() {
        // subscription order matters. DOM updates depend on the processing of line status.
        subscribeToStore(this.updateDOM_.bind(this));
        this.tubeStatusWrapper_ = document.querySelector('tube-status-wrapper');
        this.render_();
    }

    /**
     * Emits custom click event for modal custom element.
     * @param {Object} e
     * @private
     */
    emitEvent_(e) {
        const customEvent = new CustomEvent('line-click', {
            bubbles: true,
            detail: { line: e.target.getAttribute('line') }
        });
  
        this.dispatchEvent(customEvent);
    }

    /**
     * Updates DOM with every new line status.
     * @private
     */
    updateDOM_() {
        const { status, reason } = getStore().lineInformation[this.line_];
        const statusEl = this.querySelector('.tube-line-data-wrapper__status');
        // set score attribute on line so we can order with flexbox
        switch(status) {
            case 'No Service':
                this.setAttribute('score', 6);
                break;
            case 'Service Closed':
                this.setAttribute('score', 6);
                break;
            case 'Part Closure':
                this.setAttribute('score', 5);
                break;    
            case 'Planned Closure':
                this.setAttribute('score', 5);
                break;         
            case 'Part Suspended':
                this.setAttribute('score', 4);
                break;
            case 'Severe Delays':
                this.setAttribute('score', 3);
                break;
            case 'Minor Delays':
                this.setAttribute('score', 2);
                break;
            case 'Good Service':
                this.setAttribute('score', 1);
                break;
        }

        // remove markup before updating
        statusEl.innerText = '';
        statusEl.innerText = `${this.line_}: ${status}`;
        // line should appear clickable if there are delays/disruptions
        reason ? this.classList.add('tube-line--active') : this.classList.remove('tube-line--active');
    }

    /**
     * Renders custom element shadow DOM. Invoked each time the custom element is appended to DOM. 
     * @private
     */
    render_() {
        const template = document.createElement('template');

        template.innerHTML = `
            <style>
                .tube-line-data-wrapper {
                    color: rgba(250, 250, 250, 0.9);
                    height: 60px;
                    padding: 5px;
                    margin: 5px;
                    font-size: 18px;
                }
            </style>
            <div class="tube-line-data-wrapper" current-status>
                <slot name="status-text"></slot>
                <slot name="subscribe"></slot>
            </div>

        `;
        const templateContent = template.content;
        this.attachShadow({mode: 'open'})
            .appendChild(templateContent.cloneNode(true));
    }
}
