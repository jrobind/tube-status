import { updateStore } from './src/scripts/utils/store.js';

const PUBLIC_KEY = 'BAyM-TL7OKAfqC9A9AkUnHqyzf3Cw3yEkFmvNCg56H6GjRMxUOyW-YK4_DJ_BdFRuSFB-lxJpqXjyxFVX_hdGe4';

if ("serviceWorker" in navigator) {
    pushSubscriptionSetup().catch(handleError);
}

async function pushSubscriptionSetup() {
    // register service worker
    const register = await navigator.serviceWorker.register('./sw.js').catch(handleError);
    // register for push
    const pushSubscription = await register.pushManager.subscribe({ 
        userVisibleOnly: true,
        applicationServerKey: convertUint8Array(PUBLIC_KEY)
    }).catch(handleError);
    // update client store with the push subscription object
    updateStore('PUSH-SUBSCRIPTION', { pushSubscription });
}

function convertUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function handleError(e) {
    console.error(e);
}