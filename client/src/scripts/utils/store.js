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
      handleSubscriberCalls(action);

      return store;
    case 'AUTH':
      store = { ...store, userProfile:{ ...data } };
      handleSubscriberCalls(action);

      return store;
    case 'LOADING-APP':
      store = { ...store, ...data };
      handleSubscriberCalls(action);

      return store;
    case 'LOADING-LINE':
      store = { ...store, ...data };
      handleSubscriberCalls(action);

      return store;
    case 'PUSH-SUBSCRIPTION':
      store = { ...store, ...data };
      handleSubscriberCalls(action);

      return store;
    case 'LINE-SUBSCRIPTION':
      store = { ...store, ...data };
      handleSubscriberCalls(action);

      return store;
  }
}

/**
 * Invokes relevant subscribers after store updates.
 * @param {string} action
 */
const handleSubscriberCalls = (subscriberAction) => {
  const { subscribers } = store;
  const hasSubscribers = subscribers.length;

  if (hasSubscribers) {
    subscribers.forEach(({ callback, action }) => {
      action === subscriberAction && callback();
    });
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