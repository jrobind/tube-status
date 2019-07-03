import { store, getLine } from '../utils/store.js';

export default class TubeLine extends HTMLElement {
    constructor() {
        super();

        this.line_ = this.getAttribute('line');
        this.tubeStatusWrapper_ = null;
        this.lineStatus_ = null;
    }

    connectedCallback() {
        this.tubeStatusWrapper_  = document.querySelector('tube-status-wrapper');
        this.lineStatus_ = getLine(this.line_);
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    render_() {
        // render markup
    }
}