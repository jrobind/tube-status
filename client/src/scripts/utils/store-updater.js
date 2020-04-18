/**
 * Updates client store based on an action.
 * @param {object} store
 * @param {object} action, data
 * @return {object} store
 */
export const storeUpdater = (store, {action, data}) => {
  switch (action) {
  case "LINES":
    store = {
      ...store,
      lineInformation: {...data.lineInformation},
      lineData: {lines: {...data.result}},
    };

    return store;
  case "AUTH":
    store = {...store, userProfile: {...data}};

    return store;
  case "LOADING-APP":
    store = {...store, ...data};

    return store;
  case "LOADING-LINE":
    store = {...store, ...data};

    return store;
  case "LOADING-HEADER":
    store = {...store, ...data};

    return store;
  case "PUSH-SUBSCRIPTION":
    store = {...store, ...data};

    return store;
  case "LINE-SUBSCRIBE":
    store = {
      ...store,
      lineSubscriptions: [...data.lineSubscriptions],
    };

    return store;
  case "LINE-UNSUBSCRIBE":
    store = {
      ...store,
      lineSubscriptions: [...data.lineSubscriptions],
    };

    return store;
  case "SELECTED-DAYS":
    store = {...store, selectedSubscriptionWindow: {...data}};

    return store;
  case "SELECTED-HOURS":
    store = {...store, selectedSubscriptionWindow: {...data}};

    return store;
  case "RESET-SELECTED":
    store = {...store, selectedSubscriptionWindow: {...data}};

    return store;
  case "RESET-APP":
    store = {...store, lineSubscriptions: []};

    return store;
  case "NOTIFICATIONS-FEATURE":
    store = {...store, ...data};

    return store;
  case "DEVICE":
    store = {...store, differentDevice: {...data}};

    return store;
  }
};
