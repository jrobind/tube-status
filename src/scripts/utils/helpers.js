import store from './store.js';

export const updateStore = (data) => {
    const newStore = { ...store, lineData:{ lines: { ...data } } };
    store.lineData = newStore;
    return newStore;
}
