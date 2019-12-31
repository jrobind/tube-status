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
    .catch((e) => e);
  return logoutResponse.status;
};

/**
 * Subscribes to tube line for push notification updates.
 * @async
 * @param {object} pushSubscription
 * @param {string} line
 * @return {Promise}
 */
export const apiSubscribe = async (pushSubscription, line) => {
  const options = {
    method: "POST",
    body: JSON.stringify({pushSubscription, line}),
    headers: {
      "content-type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("JWT")}`,
    },
  };

  const subscriptionResponse = await (fetch("api/subscribe", options)
    .catch((e) => e));
  console.log(subscriptionResponse);
  return await subscriptionResponse.json();
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
    .catch((e) => e);
  console.log(unSubscriptionResponse);
  return await unSubscriptionResponse.json();
};

/**
 * Retrieves current line status data.
 * @async
 * @return {Promise}
 */
export const apiGetAllLineData = async () => {
  const lines = await fetch("api/lines")
    .catch((e) => e);

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
    .catch((e) => e);

  return await subscriptionResults.json();
};