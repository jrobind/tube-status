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
        const statusElement = this.querySelector('.tube-line-status');
        const subscribeText = statusElement.querySelector('a');
        // need to update this to handle multiple disruptions
        if (!this.lineStatus_) return;
        let status = this.lineStatus_.lineStatuses[0].statusSeverityDescription;
        if (!status) status = this.lineStatus_.lineStatuses[0].closureText;
        // remove markup before updating
        statusElement.querySelector('span') ? statusElement.innerHTML = '' : null;
        this.querySelector('.tube-line-status').insertAdjacentHTML('afterbegin', `<span>${this.line_}: ${status}</span>${subscribeText}`);
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
                <slot name="title"></slot>
                <slot name="subscribe"></slot>
            </div>
        `;
        const templateContent = template.content;
        this.attachShadow({mode: 'open'})
            .appendChild(templateContent.cloneNode(true));
    }
}
