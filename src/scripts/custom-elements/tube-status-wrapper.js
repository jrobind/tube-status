import { fetchAllLineStatus } from '../utils/api.js';
import { updateStore } from '../utils/helpers.js';

export default class TubeStatusWrapper extends HTMLElement {
    async connectedCallback() {
        try {
            const results = await fetchAllLineStatus();
            this.updateStore(results);
        } catch(e) {
            this.handleError(e);
        } 
    }

    updateStore(results) {
        console.log(results);
        // update store

    }

    handleError(e) {
        console.error(e);
    }
}

window.customElements.define('tube-status-wrapper', TubeStatusWrapper);