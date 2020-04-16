import {store} from "./utils/client-store.js";
const {updateStore} = store;

/** @const {string} */ // eslint-disable-next-line
const PUBLIC_KEY = "BKpELtYde7iajTdW7hw1LOIksmgzApC5IMLUtwDkqDA_fdqWmdQ3FqU2azo0LH0G-2cIqq11gRrxCLtFj-pPSmE";

/**
 * Initiates push subscription setup.
 * @private
 */
export const initPushSubscription = async () => {
  if ("serviceWorker" in navigator) {
    return await pushSubscriptionSetup().catch(handleError);
  }
};

/**
 * Creates push subscription object and updates client store.
 * @async
 * @private
 */
async function pushSubscriptionSetup() {
  return await navigator.serviceWorker.ready.then(async (reg) => {
    // register for push once registration is active
    if (reg.active) {
      if (reg.pushManager) {
        const pushSubscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertUint8Array(PUBLIC_KEY),
        }).catch(handleError);

        updateStore({action: "PUSH-SUBSCRIPTION", data: {pushSubscription}});
        return pushSubscription;
      } else {
        updateStore(
          {action: "PUSH-SUBSCRIPTION", data: {pushSubscription: null}});
        return null;
      }
    }
  }).catch(handleError);
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
