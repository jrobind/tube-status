// when updating store, do not mutate.
let store = {
    lineData: {
        lines: {}
    },
    subscribers: []
}

export const getStore = () => store;

export const updateStore = (data) => {
    const newStore = { ...store, lineData:{ lines: {  ...data } } };
    store = newStore;
    // invoke subscribers
    if (store.subscribers.length) store.subscribers.forEach(callback => callback());
    return store;
}

export const subscribeToStore = (callbacks) => {
    if (Array.isArray(callbacks)) {
        callbacks.forEach(callback => store.subscribers.push(callback));
    } else {
        store.subscribers.push(callbacks);
    }
};