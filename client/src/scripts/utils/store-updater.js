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
  case "LOADING":
    store = {...store, ...data};

    return store;
  case "PUSH-SUBSCRIPTION":
    store = {...store, ...data};

    return store;
  case "LINE-SUBSCRIPTION":
    store = {...store, ...data};

    return store;
  }
};
