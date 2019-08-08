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
        console.log('update triggered in process line status')
        for (let [key, value] of Object.entries(getStore().lineData.lines)) {
            if (value.id === this.line_) this.lineStatus_ = value;
        }

        // console.log(this.lineStatus_)
    }

    /**
     * Updates DOM with every new line status update.
     * @private
     */
    updateDOM_() {
        // need to update this to handle multiple disruptions
        let status = this.lineStatus_.lineStatuses[0].statusSeverityDescription;
        if (!status) status = this.lineStatus_.lineStatuses[0].closureText;

        this.querySelector('.tube-line-status').innerText = `${this.line_}: ${status}`;
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
                <div class="subscribe" line=${this.line_}>SUBSCRIBE TO ALERTS</div>
            </div>
        `;
        const templateContent = template.content;
        this.attachShadow({mode: 'open'})
            .appendChild(templateContent.cloneNode(true));
    }
}
