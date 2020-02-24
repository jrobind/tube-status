import {store} from "./utils/client-store.js";
const {updateStore} = store;

/** @const {string} */ // eslint-disable-next-line
const PUBLIC_KEY = "BKpELtYde7iajTdW7hw1LOIksmgzApC5IMLUtwDkqDA_fdqWmdQ3FqU2azo0LH0G-2cIqq11gRrxCLtFj-pPSmE";

if ("serviceWorker" in navigator) {
  pushSubscriptionSetup().catch(handleError);
}

/**
 * Creates push subscription object and updates client store.
 * @async
 * @private
 */
async function pushSubscriptionSetup() {
  // register service worker
  const register = await /** @type {Promise} */ (
    navigator.serviceWorker.register("/sw.js"))
    .catch(handleError);
  // register for push once registration is active
  if (register.active) {
    const pushSubscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertUint8Array(PUBLIC_KEY),
    }).catch(handleError);
    // update client store with the push subscription object
    updateStore({action: "PUSH-SUBSCRIPTION", data: {pushSubscription}});
  }
}

/**
 * Converts a base64 string into a binary Uint8 Array.
 * @param {string} base64String
 * @return {object}
 * @private
 */
function convertUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+") // eslint-disable-line
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Handles api fetch errors.
 * @param {object} e
 * @private
 */
function handleError(e) {
  console.error(e);
}
