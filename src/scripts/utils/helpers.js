import store from './store.js';

export const updateStore = (data) => {
    const newStore = { ...store, ...data };
    store.lineData = newStore;
    return newStore;
}
