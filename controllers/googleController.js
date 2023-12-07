// require('dotenv').config();
// const User = require('../models/userSchema');
// const jwt = require('jsonwebtoken');


// const google = async (accessToken, refreshToken, profile, cb) => {
//     try {
//         const existingUser = await User.findOne({ email: profile.emails[0].value });

//         if (existingUser) {
//             // User already exists, return the user data
//             return cb(null, existingUser);

//         }
//         // If the user doesn't exist, create a new one
//         const newUser = new User({
//             googleId: profile.id,
//             email: profile.emails[0].value,
//             userName: profile.displayName,
//             provider: 'google',
//             googleToken: accessToken,

//         });

//         await newUser.save();

//         return cb(null, { user: newUser});
    
//     } catch (error) {
      
//         console.error('Error in google:', error);
//         return cb(error, null);
//     }
// };
// const google_callback_get = (req, res) => {
//     // Successful authentication, redirect to success screen.
//     res.redirect('http://localhost:3000/auth/google/callback');
// };
// const google_success_get = async (req, res) => {
//     console.log(req.session);
//     try {
//         if (!req.session || !req.session.passport || !req.session.passport.user || !req.session.passport.user._id) {
//             return res.status(401).json({ status: 0, error: 'Unauthorized' });
//         }
//         const googleId = req.session.passport.user.id;
//         const user = await User.findOne({ googleId: googleId });

//         if (!user) {
//             return res.status(404).json({ status: 0, error: 'User not found' });
//         }

//         // Add the token generation and storage logic here
//         const token = jwt.sign({ userId: user._id, provider: 'google' }, process.env.KEY_TOKEN);
//          user.tokens.push(token);
//          await user.save();

//         if (user.tokens.length >= process.env.COUNT_TOKEN) {
//             return res.status(500).json({ status: 0, message: `You do not have the authority to own more than ${process.env.COUNT_TOKEN} devices` });
//         }
//         await user.save();

//         // Check if profile.displayName exists before using it
//         user.userName = req.session.passport.user.displayName || 'DefaultUserName';

//         await user.save();

//         return res.status(201).json({ status: 1, success: 'Logged Successfully', token: token, provider: 'google' });
//     } catch (error) {
//         console.error('Error in google_success_get:', error);
//         return res.status(500).json({ status: 0, error: error.message || 'Internal Server Error' });
//     }
// };

// const google_error_get = (req, res) => {
//     return res.status(500).json({ status: 0, error: 'Error logging in via Google.' });
// };

// const google_signout_get = async (req, res) => {
//     try {
//         const { userId } = req.decoded_token;

//         await User.updateMany({ _id: userId }, { $set: { tokens: [] } });

//         req.session.destroy(function (err) {
//             console.log('Session destroyed........');
//         });

//         return res.status(200).json({ status: 1, success: 'Logout Successfully' });
//     } catch (error) {
//         console.error('Error in google_signout_get:', error);
//         res.status(500).json({ status: 0, error: 'Internal Server Error' });
//     }
// };

// module.exports = {
//     google,
//     google_callback_get,
//     google_success_get,
//     google_error_get,
//     google_signout_get
// };
////////////////////////////////////////////////////////
// require('dotenv').config();
// const User = require('../models/userSchema');
// const jwt = require('jsonwebtoken');
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

// // Configure Google OAuth strategy
// passport.use(new GoogleStrategy({
//   clientID: process.env.clientID,
//   clientSecret: process.env.clientSecret,
//   callbackURL: 'http://localhost:3000/auth/google/callback',
 
// },
// async (accessToken, refreshToken, profile, cb) => {
//   try {
//     const existingUser = await User.findOne({ email: profile.emails[0].value });

//     if (existingUser) {
//       // User already exists, return the user data
//       return cb(null, existingUser);
//     }

//     // If the user doesn't exist, create a new one
//     const newUser = new User({
//       googleId: profile.id,
//       email: profile.emails[0].value,
//       userName: profile.displayName,
//       provider: 'google',
//     //   googleToken: accessToken,
//     });

//     await newUser.save();

//     return cb(null, newUser);
//   } catch (error) {
//     console.error('Error in Google OAuth:', error);
//     return cb(error, null);
//   }
// }));

// // Serialize user into the session
// passport.serializeUser(function (user, done) {
//   done(null, user);
// });

// // Deserialize user from the session
// passport.deserializeUser(function (obj, done) {
//   done(null, obj);
// });

// const google_callback_get = passport.authenticate('google', { scope: ['profile', 'email'] });

// const google_success_get = async (req, res) => {
//   try {
//     if (!req.session || !req.session.passport || !req.session.passport.user || !req.session.passport.user._id) {
//       return res.status(401).json({ status: 0, error: 'Unauthorized' });
//     }

//     const googleId = req.session.passport.user.id;
//     const user = await User.findOne({ googleId: googleId });

//     if (!user) {
//       return res.status(404).json({ status: 0, error: 'User not found' });
//     }

//     // Add the token generation and storage logic here
//     const token = jwt.sign({ userId: user._id, provider: 'google' }, process.env.KEY_TOKEN);

//     if (user.tokens.length >= process.env.COUNT_TOKEN) {
//       return res.status(500).json({ status: 0, message: `You do not have the authority to own more than ${process.env.COUNT_TOKEN} devices` });
//     }

//     user.tokens.push(token);
//     await user.save();

//     // Check if profile.displayName exists before using it
//     user.userName = req.session.passport.user.displayName || 'DefaultUserName';
//     await user.save();

//     return res.status(201).json({ status: 1, success: 'Logged Successfully', token: token, provider: 'google' });
//   } catch (error) {
//     console.error('Error in Google Success:', error);
//     return res.status(500).json({ status: 0, error: error.message || 'Internal Server Error' });
//   }
// };

// const google_error_get = (req, res) => {
//   return res.status(500).json({ status: 0, error: 'Error logging in via Google.' });
// };

// const google_signout_get = async (req, res) => {
//   try {
//     const { userId } = req.decoded_token;

//     await User.updateMany({ _id: userId }, { $set: { tokens: [] } });

//     req.session.destroy(function (err) {
//       console.log('Session destroyed........');
//     });

//     return res.status(200).json({ status: 1, success: 'Logout Successfully' });
//   } catch (error) {
//     console.error('Error in Google Signout:', error);
//     res.status(500).json({ status: 0, error: 'Internal Server Error' });
//   }
// };

// module.exports = {
//   google_callback_get,
//   google_success_get,
//   google_error_get,
//   google_signout_get
// };

///////////////////////////////////
// googleController.js
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');

const google_SignIn = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: 0, error: 'Unauthorized' });
    }
    const googleId = req.user.id;
    let user = await User.findOne({ googleId });

    if (!user) {
      // If the user doesn't exist, create a new one
      user = new User({
        googleId,
        email: req.user.emails[0].value,
        userName: req.user.displayName,
        provider: 'google',
      });

      await user.save();
    }

    // Add the token generation and storage logic here
    const token = jwt.sign({ userId: user._id, provider: 'google' }, process.env.KEY_TOKEN);

    if (user.tokens.length >= process.env.COUNT_TOKEN) {
      return res.status(500).json({ status: 0, message: `You do not have the authority to own more than ${process.env.COUNT_TOKEN} devices` });
    }

    user.tokens.push(token);
    await user.save();

    // Check if profile.displayName exists before using it
    user.userName = req.user.displayName || 'DefaultUserName';
    await user.save();

    return res.status(201).json({ status: 1, success: 'Logged Successfully', token, provider: 'google' });
  }  catch (error) {
    if (error.name === 'ValidationError') {
        console.error('Validation Errors:', error.errors);
      const validationErrors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ status: 0, message: 'User validation failed', errors: validationErrors });
    }
    return res.status(500).json({ status: 0, message: 'Internal Server Error', error: error.message });
  }
};


const  google_Logout = async (req, res) => {

const { userId } = req.decoded_token 

console.log("ID ==> " + userId)

try {

    await User.updateMany({_id: userId}, { $set: { tokens: [] } })

    req.session.destroy(function (err) {
        console.log('session destroyed........');
    });

    return res.status(200).json({ status: 1, success: 'logout Successfully' })
    // res.render('auth');
} catch (err) {
    res.status(400).send({ message: 'Failed to sign out fb user' })
}
}

const get_gmail_users = async (req, res) => {
  try {
    const googleUsers = await User.find({ provider: 'google' });
    return res.status(200).json({ status: 1, users: googleUsers });
  } catch (error) {
    console.error('Error fetching Google users:', error);
    return res.status(500).json({ status: 0, error: 'Internal Server Error' });
  }
}
module.exports = {
  google_SignIn,
  google_Logout,
  get_gmail_users
};
