import express from 'express';
import session from 'express-session';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import mongoose from 'mongoose';
import User from './models/user.js';
import routes from './routes/routes.js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: 'process.env' });  // Load environment variables from .env file

const app = express();

// Check if the MONGO_URL is correctly loaded
if (!process.env.MONGO_URL) {
  console.error('MONGO_URL environment variable is not defined.');
  process.exit(1);  // Exit the application if the MONGO_URL is not defined
}

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Express session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your_secret_key',  // Use an environment variable for security
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport and use session
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
})();

// Configure Passport to use local strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Use routes
app.use(routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
