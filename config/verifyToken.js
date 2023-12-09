// require('dotenv').config();
// const jwt = require('jsonwebtoken');
// const User = require('../models/userSchema');

// async function verifyToken(req, res, next) {
//   const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ message: "Token not found" });
//   }

//   jwt.verify(token, process.env.KEY_TOKEN, async (err, decoded) => {
//     if (err) {
//       return res.status(403).json({ message: 'Token invalid' });
//     }

//     try {
//       const user = await User.findById(decoded.userId);
//       if (!user) {
//         return res.status(404).json({ status: 0, message: 'User Not Found DB' });
//       }

//       if (decoded.provider === "email") {
//         try {
//           const isTrue = await User.findOne({ tokens: token });
//           if (!isTrue) {
//             return res.status(404).json({ status: 0, message: 'User Token Not Found DB, Please Login Again' });
//           }
//         } catch (error) {
//           return res.status(500).json({ status: 0, error: error.message });
//         }
//       } else if (decoded.provider === "facebook") {
//         try {
//           const isTrue = await User.findOne({ tokens: token });
//           if (!isTrue || isTrue.provider !== "facebook") {
//             return res.status(404).json({ status: 0, message: 'User Token And Provider Not Found DB, Please Login Again' });
//           }
//         } catch (error) {
//           return res.status(500).json({ status: 0, error: error.message });
//         }
//       }

//       // Call next() to proceed to the next middleware
//       next();
//     } catch (error) {
//       console.error('Error in verifyToken:', error);
//       return res.status(500).json({ status: 0, error: error.message || 'Internal Server Error' });
//     }
//   });
// }

// module.exports = verifyToken;

////////////////////////////////
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');

async function verifyToken(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  jwt.verify(token, process.env.KEY_TOKEN, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalid' });
    }

    try {
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ status: 0, message: 'User Not Found DB' });
      }

      if (decoded.provider === "email") {
        try {
          const isTrue = await User.findOne({ tokens: token });
          if (!isTrue) {
            return res.status(404).json({ status: 0, message: 'User Token Not Found DB, Please Login Again' });
          }
        } catch (error) {
          return res.status(500).json({ status: 0, error: error.message });
        }
      } 
      else if (decoded.provider === "facebook") {
        try {
          const isTrue = await User.findOne({ tokens: token });
          if (!isTrue || isTrue.provider !== "facebook") {
            return res.status(404).json({ status: 0, message: 'User Token And Provider Not Found DB, Please Login Again' });
          }
        } catch (error) {
          return res.status(500).json({ status: 0, error: error.message });
        }
      }

      // Call next() to proceed to the next middleware
      next();
    } catch (error) {
      console.error('Error in verifyToken:', error);
      return res.status(500).json({ status: 0, error: error.message || 'Internal Server Error' });
    }
  });
}

module.exports = verifyToken;


