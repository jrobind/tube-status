import {storeUpdater} from "./store-updater.js";
import {initialStore} from "./initial-store.js";

/**
 * Creates client store.
 * @param {function} storeUpdater
 * @param {object} initialStore
 * @return {object}
 */
const createStore = (storeUpdater, initialStore) => {
  const subscribers = [];
  let currentStore = initialStore;

  /**
   * Returns client store.
   * @return {object}
   */
  const getStore = () => {
    return currentStore;
  };

  /**
   * Invokes relevant subscribers after store updates.
   * @param {string} update
   */
  const updateStore = (update) => {
    const hasSubscribers = subscribers.length;

    currentStore = storeUpdater(currentStore, update);

    if (hasSubscribers) {
      subscribers.forEach(({callback, action}) => {
        action === update.action && callback();
      });
    }
  };

  /**
   * Adds store subscription callbacks.
   * Once updates are made to the store, subscribers are invoked.
   * @param {object} callbacks
   */
  const subscribeToStore = (callbacks) => {
    if (Array.isArray(callbacks)) {
      callbacks.forEach((callback) => subscribers.push(callback));
    } else {
      subscribers.push(callbacks);
    }
  };

  return {getStore, updateStore, subscribeToStore};
};

// initialise client store
const clientStore = createStore(storeUpdater, initialStore);

// enable rest of the app to access the client store
export const store = clientStore;
