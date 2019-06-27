import { fetchAllLineStatus } from '../utils/api.js';
import { updateStore } from '../utils/helpers.js';

export default class TubeStatusWrapper extends HTMLElement {
    async connectedCallback() {
        try {
            const results = await fetchAllLineStatus();
            this.updateStore_(results);
        } catch(e) {
            this.handleError_(e);
        } 
    }

    updateStore_(results) {
        // update store
        updateStore(results);
    }

    handleError_(e) {
        console.error(e);
    }
}
