// when updating store, do not mutate.
let store = {
    lineData: {
        lines: {}
    },
    userProfile: {
        signedIn: false,
        id: null,
        displayName: null,
        avatar: null,
        email: null
    },
    subscribers: []
}

export const getStore = () => store;

export const updateStoreAuth = (data) => {
    const newStore = { ...store, userProfile:{ ...data } };
    store = newStore;
    // invoke subscribers
    // if (store.subscribers.length) store.subscribers.forEach(callback => callback());
    // return store;
}

export const updateStore = (data) => {
    const newStore = { ...store, lineData:{ lines: {  ...data } } };
    store = newStore;

    // if (store.subscribers.length) store.subscribers.forEach(callback => callback());
    // return store;
}

export const subscribeToStore = (callbacks) => {
    if (Array.isArray(callbacks)) {
        callbacks.forEach(callback => store.subscribers.push(callback));
    } else {
        store.subscribers.push(callbacks);
    }
};