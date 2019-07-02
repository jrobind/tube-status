import { store, updateStore } from '../utils/store.js';
import { fetchAllLineStatus } from '../utils/api.js';

export default class TubeStatusWrapper extends HTMLElement {
    constructor() {
        super();
        
        this.results_ = null;
    }

    async connectedCallback() {
        try {
            this.results_ = await fetchAllLineStatus();
            this.updateStore_(this.results_);
            // dispatch event once initial store update has been completed
            this.dispatchEvent(new Event('initialise'));
        } catch(e) {
            this.handleError_(e);
        } 
    }

    updateStore_(results) {
        // update store
        console.log(updateStore(results));

    }

    handleError_(e) {
        console.error(e);
    }
}
