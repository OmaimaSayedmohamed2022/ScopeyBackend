const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const mongoose= require('mongoose');
const http = require('http');
const server = http.createServer(app);
const socketIo = require("socket.io");
const io= socketIo(server);
const scopeRouter = require("./routes/scpoeRouter");
const cors = require('cors');
const userRoutes = require('./routes/userRouter');
const googleRoutes = require('./routes/googleRouter');
const facebookRoutes = require('./routes/facebookRouter');
const cookieParser = require('cookie-parser')
const images = require("./controllers/imagesController")
const { logger, logEvents } = require('./config/logger');
const errorHandler = require('./config/errorHandler');

require('dotenv').config();
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
  origin: [process.env.CLIENT_URL, "*"],
  methods: 'GET, POST, PUT, DELETE',
  credentials: true,
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.status(200).send();
});

// Define routes
app.use('/api/user', userRoutes); 
app.use('/auth/google', googleRoutes);
app.use('/api/auth/facebook', facebookRoutes)
app.use('/api/image',images)
app.use('/api/scope' , scopeRouter)

app.get('/', (req, res) => {
  console.log('Reached the root route!')
  res.send('hello, Scopey app');
});


io.on('connection', (socket) => {
  console.log('A new client connected');

  // Listen for messages from clients
  socket.on('message', (message) => {
      console.log('Message received:', message);

      // Echo the message back down to the client
      socket.emit('message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log('Client disconnected');
  });
});

mongoose
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@scopeyapi.kmdz5wv.mongodb.net/${process.env.DB_NAME}`)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at https://scopey.onrender.com:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    logEvents(`${err.name}: ${err.message}\t${err.stack}`, 'mongoErrLog.log');



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


