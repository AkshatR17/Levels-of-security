//jshint esversion:6
require('dotenv').config()
// console.log(process.env) 

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
// const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
// we don't need to require passport local as passport local mongoose will explicitly require it.
const flash = require('connect-flash');
// used for sending message of wrong inputs
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

mongoose.connect(process.env.CLUSTER);

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
// its gonna hash and salt passwords in database
userSchema.plugin(findOrCreate);
// google oauth proccess

const user = mongoose.model('userData', userSchema);

passport.use(user.createStrategy());

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});


// google oauth
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
    function (accessToken, refreshToken, profile, cb) {
        user.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));


// if user is authenticated he should directly land on secrets page like twitter 
app.get('/', (req, res) => {
    res.redirect('/home');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/secrets');
});

// In above both routes we have used middlewares.

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/secrets', async (req, res) => {
    try {
        // Check if the user is authenticated or not
        const foundUsers = await user.find({'secret': { $ne: null }}).exec();

        if (foundUsers) {
            res.render('secrets', { usersWithSecrets: foundUsers });
        }
    } catch (err) {
        console.log(err);
        // Handle errors appropriately
    }
});


app.get('/submit', (req, res) => {

    if (req.isAuthenticated()) {
        res.render('submit');
    }
    else {
        res.redirect('/login');
    }
});

app.post('/submit',async (req, res) => {

    const submittedSecret = req.body.secret;

    // console.log(submittedSecret);
    // console.log(req.user);
    try {
        const foundUser = await user.findById(req.user.id);

        if (foundUser) {
            foundUser.secret = submittedSecret;
            await foundUser.save();
            res.redirect('/secrets');
        }
    } catch (err) {
        console.log(err);
    }

});

app.post('/register', (req, res) => {

    user.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/register')
        } else {
            passport.authenticate('local')(req, res, () => {
                res.redirect('/secrets');
                // notice we are redirecting instead of rendering as now once user is authenticated we know that he can access the page uninterruptedly.
            });
        }
    });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/secrets',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/login', (req, res) => {
    res.render('login', { message: req.flash('error') });
});

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});


app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});