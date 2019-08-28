import { updateStoreAuth, getStore } from './src/scripts/utils/store.js';

document.addEventListener("DOMContentLoaded", function() {
    const token = localStorage.getItem('JWT');
    // if token exists, login was successful
    if (token) {
        // decode JWT profile data
        const { displayName, emails, photos, id } = JSON.parse(window.atob(token.split('.')[1]));

        updateStoreAuth({ signedIn: true, displayName, email: emails[0].value, avatar: photos[0].value, id });
        console.log(getStore());
        const store = getStore();
        // set avatar
        document.getElementById('google-avatar').src = store.userProfile.avatar;
    }
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
                            if (getStore().userProfile.signedIn) {
                                const line = e.target.getAttribute('line');
                                // post subscription
                                fetch('/subscribe',{ 
                                    method: 'POST',
                                    body: JSON.stringify({ pushSubscription, line }),
                                    headers: {
                                        'content-type': 'application/json'
                                    }
                                });
                            } else {
                                alert('sign in')
                                document.getElementById('sign-in')
                                    .scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
                            }
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

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('JWT');
    updateStoreAuth({ signedIn: false, displayName: null, email: null, avatar: null, id: null });
    console.log(getStore())
});

document.getElementById('protected').addEventListener('click', () => {
    const token = localStorage.getItem('JWT');
    fetch('/protected', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.status === 401) {
            alert('please login');
        } else {
            console.log(response, 'SUCCESS!')
        }
    })
    .catch(e => console.log(e));
});