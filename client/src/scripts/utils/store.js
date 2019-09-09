// when updating store, do not mutate.
let store = {
    lineData: {
        lines: {}
    },
    userProfile: {
        signedIn: false,
        id: null,
        avatar: null,
    },
    loadingState: false,
    subscribers: []
}

export const getStore = () => store;

export const updateStore = (action, data) => {
    switch(action) {
        case 'LINES':
            store = { ...store, lineData:{ lines: {  ...data } } };
            // invoke subscribers
            store.subscribers.length && store.subscribers.forEach(callback => callback());

            return store;
        case 'AUTH':
            store = { ...store, userProfile:{ ...data } };
            store.subscribers.length && store.subscribers.forEach(callback => callback());

            return store;
        case 'LOADING':
            store = { ...store, ...data };
            store.subscribers.length && store.subscribers.forEach(callback => callback());

            return store;
    }
}

export const subscribeToStore = (callbacks) => {
    if (Array.isArray(callbacks)) {
        callbacks.forEach(callback => store.subscribers.push(callback));
    } else {
        store.subscribers.push(callbacks);
    }
};