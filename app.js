//jshint esversion:6

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb+srv://admin:H8gVgrtTkTOAT27A@cluster0.zirtemd.mongodb.net/userData');

const userSchema = mongoose.Schema({
    email: String,
    password: String
});

const user = mongoose.model('userData', userSchema);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {

    try {
        await user.create({
            email: req.body.username,
            password: req.body.password
        });
        res.render('secrets')
    } catch (error) {
        console.log(error);
    }

});

app.post('/login', async (req, res) => {

    const userName = req.body.username;
    const password = req.body.password;

    try {
        const userD = await user.findOne({ email: userName });

        if (userD.password === password) {
            res.render('secrets');
        }
        else{
            res.status(411).json({
                msg: 'Invalid password'
            })
        }
    } catch (error) {
        console.log(error);
    }

});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});