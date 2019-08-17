function onSignIn(googleUser) {
  const profile = googleUser.getBasicProfile();
  const name = profile.getName();
  const avatar = profile.getImageUrl();
  const email = profile.getEmail();

  console.log('Name: ' + name);
  console.log('Image URL: ' + avatar);
  console.log('Email: ' + email);

  fetch('api/subscribe',{ 
    method: 'POST',
    body: JSON.stringify({ name, avatar, email }),
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
  