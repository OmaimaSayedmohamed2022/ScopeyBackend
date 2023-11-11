// const express = require('express');
// const passport = require('passport');
// const router = express.Router();


// router.get('/auth/google/callback', passport.authenticate('google', { 
//   scope: ['profile', 'email'] }));

// router.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/' }),
//   (req, res) => {
//     res.redirect('/');
//   }
// );

// module.exports = router;
///////////////////////////////////////
// const express = require('express');
// const router = express.Router();
// const googleController = require('../controllers/googleController.js');
// const verifyToken = require('../config/verifyToken.js');
// const User = require('../models/userSchema.js');
// require('dotenv').config();
// // ========== Auth Google ==========
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// passport.use(new GoogleStrategy(
//     {
//         clientID: process.env.clientID,
//         clientSecret: process.env.clientSecret,
//         callbackURL: 'http://localhost:3000/auth/google/callback',
//         scope: ['profile', 'email']
//     },
//     googleController.google
// ));

// router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/success', verifyToken, googleController.google_success_get);
// router.get('/callback', passport.authenticate('google', { failureRedirect: '/auth/google/error' }), googleController.google_callback_get);
// router.get('/success', googleController.google_success_get);
// router.get('/error', googleController.google_error_get);
// // set verifyToken to get data from token
// router.get('/signout', verifyToken, googleController.google_signout_get);

// module.exports = router;


////////////////////////////////////////
// googleRouter.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const googleController = require('../controllers/googleController');
const verifyToken = require('../config/verifyToken')

passport.use(new GoogleStrategy(
  {
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: 'http://localhost:3000/auth/google/callback',
    scope: ['profile', 'email'],
  },
  function(accessToken, refreshToken, profile, cb) {
    userProfile=profile;
    return cb(null, userProfile);
}
));

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000/auth/google/error' }), googleController.google_SignIn);
router.get('/success', googleController.google_SignIn);
router.get('/error', (req, res) => res.status(500).json({ status: 0, error: 'Error logging in via Google.' }));

router.get('/logout',verifyToken, googleController.google_Logout);
//get all google users 
router.get('/data',verifyToken, googleController.get_gmail_users);



module.exports = router;
