import { subscribeToStore, updateStore, getStore } from '../utils/store.js';

export default class TubeLine extends HTMLElement {
    constructor() {
        super();

        this.line_ = this.getAttribute('line');
        this.tubeStatusWrapper_ = null;
        this.lineStatus_ = null;
    }

    connectedCallback() {
        // subscribe to store updatesn (order matters)
        subscribeToStore([this.processLineStatus_.bind(this), this.updateDOM_.bind(this)]);
        this.tubeStatusWrapper_  = document.querySelector('tube-status-wrapper');
        this.render_();
    }

    processLineStatus_() {
        console.log('update triggered in process line status')
        for (let [key, value] of Object.entries(getStore().lineData.lines)) {
            if (value.id === this.line_) this.lineStatus_ = value;
        }

        console.log(this.lineStatus_)
    }

    updateDOM_() {
        const status = this.lineStatus_.lineStatuses[0].statusSeverityDescription
        this.shadowRoot.querySelector('#line-status').innerText = `${this.line_}: ${status}`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

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
                <div id="line-status"></div>
                <div>SUBSCRIBE TO ALERTS</div>
            </div>
        `;
        const templateContent = template.content;
        const shadowRoot = this.attachShadow({mode: 'open'})
            .appendChild(templateContent.cloneNode(true));
    }
}
