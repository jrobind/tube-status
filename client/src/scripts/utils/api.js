/**
 * Logs the user out.
 * @async
 * @return {Promise}
 */
export const apiLogout = async () => {
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const logoutResponse = await fetch("api/logout", options)
    .catch((e) => console.error(e));
  return logoutResponse.status;
};

/**
 * Request for .txt file containing all user data.
 * @async
 * @return {Promise}
 */
export const apiDownload = async () => {
  const options = {
    method: "GET",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const downloadResponse = await fetch("api/download", options)
    .catch((e) => console.error(e));
  return downloadResponse;
};

/**
 * Remove user account.
 * @async
 * @return {Promise}
 */
export const apiRemoveAccount = async () => {
  const options = {
    method: "DELETE",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const response = await fetch("api/remove", options)
    .catch((e) => console.error(e));
  return response.status;
};

/**
 * Subscribes to tube line for push notification updates.
 * @async
 * @param {object} pushSubscription
 * @param {string} line
 * @param {object} window
 * @return {Promise}
 */
export const apiSubscribe = async (pushSubscription, line, window) => {
  const options = {
    method: "POST",
    body: JSON.stringify({pushSubscription, line, window}),
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const subscriptionResponse = await (fetch("api/subscribe", options)
    .catch((e) => console.error(e)));
  return await subscriptionResponse.json();
};

/**
 * Get user push subscription endpoint (if it exists).
 * @async
 * @return {Promise}
 */
export const apiSubscribeEndpoint = async () => {
  const options = {
    method: "GET",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const endpointResponse = await (fetch("api/subscribe/endpoint", options)
    .catch((e) => console.error(e)));
  return await endpointResponse.json();
};

/**
 * Unsubscribe from tube line push notification updates.
 * @async
 * @param {string} line
 * @return {Promise}
 */
export const apiUnsubscribe = async (line) => {
  const options = {
    method: "DELETE",
    body: JSON.stringify({line}),
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const unSubscriptionResponse = await fetch("api/subscribe", options)
    .catch((e) => console.error(e));
  return await unSubscriptionResponse.json();
};

/**
 * Retrieves current line status data.
 * @async
 * @return {Promise}
 */
export const apiGetAllLineData = async () => {
  const lines = await fetch("api/lines")
    .catch((e) => console.error(e));

  return await lines.json();
};

/**
 * Retrieves users line subscriptions.
 * @async
 * @return {Promise}
 */
export const apiGetLineSubscriptions = async () => {
  const options = {
    method: "GET",
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const subscriptionResults = await fetch("api/subscribe", options)
    .catch((e) => console.error(e));

  return await subscriptionResults.json();
};
