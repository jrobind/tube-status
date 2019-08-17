function onSignIn(googleUser) {
  const token = googleUser.getAuthResponse().id_token;

  fetch('api/subscribe',{ 
    method: 'POST',
    body: JSON.stringify({ token }),
    headers: {
        'content-type': 'application/json'
    } 
  })
  .then((res) => console.log(res))
  .catch((err) => console.log(err));
}

function signOut() {
  const auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(() => {
    console.log('User signed out.');
  });
}
  