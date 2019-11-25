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
  loadingState: {
    state: false,
    type: null,
    line: null,
  },
  pushSubscription: null,
  lineSubscriptions: [],
  lineInformation: null,
  subscribers: []
}

/**
 * Returns client store.
 * @returns {object}
 */
export const getStore = () => store;

/**
 * Updates client store based on action.
 * @param {string} action
 * @param {object} data
 */
export const updateStore = (action, data) => {
  switch(action) {
    case 'LINES':
      store = { 
        ...store,
        lineInformation:{ ...data.lineInformation },
        lineData:{ lines: {  ...data.deserialised } }
      };
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
    case 'PUSH-SUBSCRIPTION':
      store = { ...store, ...data };

      return store;
    case 'LINE-SUBSCRIPTION':
      store = { ...store, ...data };
      store.subscribers.length && store.subscribers.forEach(callback => callback());

      return store;
  }
}

/**
 * Adds store subscription callbacks. Once updates are made to the store, subscribers are invoked.
 * @param {function} callbacks
 */
export const subscribeToStore = (callbacks) => {
  if (Array.isArray(callbacks)) {
    callbacks.forEach(callback => store.subscribers.push(callback));
  } else {
    store.subscribers.push(callbacks);
  }
};