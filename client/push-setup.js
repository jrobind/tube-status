document.addEventListener("DOMContentLoaded", function() {
    if ('serviceWorker' in navigator) {
        // register service worker
        navigator.serviceWorker.register('./sw.js')
            // register for push
            .then(registration => {
                const publicKey = 'BAyM-TL7OKAfqC9A9AkUnHqyzf3Cw3yEkFmvNCg56H6GjRMxUOyW-YK4_DJ_BdFRuSFB-lxJpqXjyxFVX_hdGe4';
                registration.pushManager.subscribe({ 
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                })
                .then(pushSubscription => {
                    // setup listeners for line push subscription
                    [...document.querySelectorAll('tube-line')].forEach(el => {
                        el.shadowRoot.querySelector('.subscribe').addEventListener('click', (e) => {
                            const line = e.target.getAttribute('line');
                            // post subscription
                            fetch('/subscribe',{ 
                                method: 'POST',
                                body: JSON.stringify({ pushSubscription, line }),
                                headers: {
                                    'content-type': 'application/json'
                                }
                            });
                        });
                    });
                })
            });
    }
    
    function urlBase64ToUint8Array(base64String) {
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
});