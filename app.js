const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/userRouter');
const googleRoutes = require('./routes/googleRouter');
const facebookRoutes = require('./routes/facebookRouter');
const cookieParser = require('cookie-parser')
const User = require('./models/userSchema'); // Correctly import the User model
const { logger, logEvents } = require('./config/logger');
const errorHandler = require('./config/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger);
app.use(errorHandler);
app.use(cookieParser())
app.use(express.json());
// Express Session
app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: true,
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
// Passport Serialize and Deserialize User
passport.serializeUser(function (user, cb) {
  cb(null, user);
})
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
})

app.use(cors({
  origin: 
  'https://projectscopey.onrender.com',
  methods: 'GET, POST, PUT, DELETE',
  credentials: true,
}));

// Define routes
app.use('/api/user', userRoutes); 
app.use('/auth/google', googleRoutes);
app.use('/api/auth/facebook', facebookRoutes)

app.get('/', (req, res) => {
  console.log('Reached the root route!')
  res.send('hello world!');
});
// ========== Connect DataBase ===========
mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@scopeyapi.kmdz5wv.mongodb.net/${process.env.DB_NAME}`)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    logEvents(`${err.name}: ${err.message}\t${err.stack}`, 'mongoErrLog.log');
  });



///////////////////////////////////////////






// const googleMapsClient = require('@googlemaps/google-maps-services-js').createClient({
//     key: 'YOUR_GOOGLE_MAPS_API_KEY',
//   });
  
// app.get('/geocode', (req, res) => {
//     const address = req.query.address;
  
//     googleMapsClient.geocode({
//       address: address,
//     }, (response) => {
//       res.json(response.json.results);
//     });
//   });


