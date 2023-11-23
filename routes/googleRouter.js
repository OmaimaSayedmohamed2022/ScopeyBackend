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
    callbackURL: 'https://projectscopey.onrender.com/auth/google/callback',
    scope: ['profile', 'email'],
  },
  function(accessToken, refreshToken, profile, cb) {
     console.log('accessToken:', accessToken);
    userProfile=profile;
    return cb(null, userProfile);
}
));

router.get('/', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/callback', passport.authenticate('google', { failureRedirect: 'https://projectscopey.onrender.com/auth/google/error' }), googleController.google_SignIn);
router.get('/success', googleController.google_SignIn);
router.get('/error', (req, res) => res.status(500).json({ status: 0, error: 'Error logging in via Google.' }));

router.get('/logout',verifyToken, googleController.google_Logout);
//get all google users 
router.get('/data',verifyToken, googleController.get_gmail_users);



module.exports = router;
