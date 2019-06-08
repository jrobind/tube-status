// when updating store, do not mutate.

class Store {
    constructor() {
        this.lineData = {
            lines: {
                'central': null,
                'district': null
            }
        }
    }
}

const store = new Store();
export default store;