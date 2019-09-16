import { updateStore } from './store.js';

export const pushSubscriptionSetup = () => {
    if ('serviceWorker' in navigator) {
        // register service worker
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                // register for push
                const publicKey = 'BAyM-TL7OKAfqC9A9AkUnHqyzf3Cw3yEkFmvNCg56H6GjRMxUOyW-YK4_DJ_BdFRuSFB-lxJpqXjyxFVX_hdGe4';
                registration.pushManager.subscribe({ 
                    userVisibleOnly: true,
                    applicationServerKey: convertUint8Array(publicKey)
                })
                .then(pushSubscription => {
                    updateStore('PUSH-SUBSCRIPTION', { pushSubscription });
                }).catch(e => console.log(e))
            });
    }
}

const convertUint8Array = (base64String) => {
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