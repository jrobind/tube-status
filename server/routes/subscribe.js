const express = require('express');
const fetch = require('node-fetch');
const db = require('../models');

const router = express.Router();

// subscribe Route
router.post('/subscribe', (req, res) => {
    const { token } = req.body;
    const lines = req.body.lines || [];
    console.log(req.body)
    fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`)
        .then(res => {
            console.log(res.status)
            // 200 response means token is validated
            if (res.status === 200) {
                return res.json()
            }
        })
        .then(data => {
            // check aud claim matches client ID
            if (data.aud === '55387840936-mejpra12qf0d4rlrr6n3kta1boor8jh1.apps.googleusercontent.com') {
                const googleId = data.sub;
                const profileData = { 
                    googleId, // store user in db using unique Google id
                    name: data.name,
                    email: data.email,
                    avatar: data.picture,
                    lines
                };
                    // check if user exists. If not, then add to db.
                    db.UserModel.findOne({ googleId }, (err, resp) => {
                        if (resp) {
                            const query = { 'googleId': profileData.googleId };
                            
                            db.UserModel.findOneAndUpdate(query, { $push: { lines } },
                              (err, success) => {
                                    if (err) {
                                        console.log('Failed to update');
                                    } else {
                                        console.log('Successfully updated', success);
                                        console.log(lines)
                                        res.json('success')
                                    }
                                });
                            return
                        } else {
                            const newUser = new db.UserModel(profileData);
                            newUser.save()
                                .then((newUser) => console.log('User added to db', newUser));
                        }
                    })
            }
        })
        .catch(err => console.log(err))
    
    // const { pushSubscription, line } = req.body;
    // dataStore.lines.push(line);

    // const payload = JSON.stringify({title: "TESTING"})
    // webpush
    //     .sendNotification(pushSubscription, payload)
    //     .catch(err => console.error(err));

});

module.exports = router;