require('dotenv').config()
const express = require('express');
const router = express.Router();
const facebookController = require('../controllers/facebookController.js');
const verifyToken = require('../config/verifyToken.js');
const User = require('../models/userSchema.js')

// ========== Auth Facebook ==========
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy


passport.use(new FacebookStrategy(
        {
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_SECRET_KEY,
            callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        },
        facebookController.facebook
    )
)

router.get('/', passport.authenticate('facebook', { scope: 'email' }))
router.get('/callback', passport.authenticate('facebook', { failureRedirect: 'https://scopey.onrender.com/api/auth/facebook/error',}), facebookController.facebook_callback_get)
router.get('/success', facebookController.facebook_success_get)
router.get('/error', facebookController.facebook_error_get)
// set verifyToken to get data from token
router.get('/signout', verifyToken, facebookController.facebook_signout_get)



module.exports = router
