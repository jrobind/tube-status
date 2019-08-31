import { updateStoreAuth, getStore } from './src/scripts/utils/store.js';

export function onSignIn(googleUser) {
  const token = googleUser.getAuthResponse().id_token;

  fetch('api/subscribe',{ 
    method: 'POST',
    body: JSON.stringify({ token, lines: 'central' }),
    headers: {
        'content-type': 'application/json'
    } 
  })
  .then((res) => {
    updateStoreAuth(true)
    console.log('User signed in.', getStore());
  })
  .catch((err) => console.log(err));
}

export function signOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(() => {
    updateStoreAuth(false)
    console.log('User signed out.', getStore());
  });
}