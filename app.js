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
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(session({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

mongoose.connect(process.env.CLUSTER);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
// its gonna hash and salt passwords in database

const user = mongoose.model('userData', userSchema);

passport.use(user.createStrategy());

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// if user is authenticated he should directly land on secrets page like twitter 
app.get('/',(req,res)=>{
    res.redirect('/secrets');
});

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/secrets', (req,res)=>{
    // we will check if the user is authenticated or not
    if (req.isAuthenticated()) {
        res.render('secrets');
    }
    else{
        res.redirect('/home');
    }
});

app.post('/register', (req, res) => {

    user.register({username: req.body.username}, req.body.password, (err, user)=>{
        if (err) {
            console.log(err);
            res.redirect('/register')
        }else{
            passport.authenticate('local')(req, res, ()=>{
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