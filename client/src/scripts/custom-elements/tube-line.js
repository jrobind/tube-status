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
    }

    connectedCallback() {
        // subscription order matters. DOM updates depend on the processing of line status.
        subscribeToStore([this.processLineStatus_.bind(this), this.updateDOM_.bind(this)]);
        this.tubeStatusWrapper_ = document.querySelector('tube-status-wrapper');
        this.render_();
    }

    /**
     * Sets current line status data for custom element.
     * @private
     */
    processLineStatus_() {
        // console.log('update triggered in process line status')
        for (let [key, value] of Object.entries(getStore().lineData.lines)) {
            if (value.id === this.line_) this.lineStatus_ = value;
        }
    }

    /**
     * Updates DOM with every new line status.
     * @private
     */
    updateDOM_() {
        const statusEl = this.querySelector('.tube-line-status .status-text');
        const lineStatuses = this.lineStatus_.lineStatuses[0];
        
        // need to update this to handle multiple disruptions
        let status = lineStatuses.statusSeverityDescription ? lineStatuses.statusSeverityDescription : lineStatuses.closureText;
        // part-suspended = 5, severe delays = 4, no-service = 3, minor delays = 2, good-service = 1

        switch(status) {
            case 'Part Suspended':
                this.setAttribute('score', 5);
                break;
            case 'Severe Delays':
                this.setAttribute('score', 4);
                break;
            case 'No Service':
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
    }

    /**
     * Renders custom element shadow DOM. Invoked each time the custom element is appended to DOM. 
     * @private
     */
    render_() {
        const template = document.createElement('template');

        template.innerHTML = `
            <style>
            .line-wrapper {
                background: red;
                width: 100%;
                height: 60px;
            }
            </style>
            <div class="line-wrapper" current-status>
                <slot name="line-status"></slot>
                <slot name="status-text"></slot>
                <slot name="subscribe"></slot>
            </div>

        `;
        const templateContent = template.content;
        this.attachShadow({mode: 'open'})
            .appendChild(templateContent.cloneNode(true));
    }
}
