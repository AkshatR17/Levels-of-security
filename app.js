//jshint esversion:6
require('dotenv').config()
// console.log(process.env) 

/*
Certainly, you can create a file like secrets.js to store sensitive information and add it to .gitignore to prevent it from being committed to version control. This approach can work, but there are some differences between using a dedicated library like dotenv and creating your own configuration file:

Convention and Standardization: dotenv follows a widely adopted convention of using a file named .env to store environment variables. This convention is recognized by many developers and tools, making it easier for others to understand and contribute to your project. Creating a custom file like secrets.js may be less standardized and might not be immediately clear to someone else working on your project.

Parsing and Loading: The dotenv module is specifically designed to parse a .env file and load its contents into the process.env object. It handles various data types and formats, making it convenient for managing environment variables. If you create your own file, you'll need to handle the parsing and loading of variables yourself.

Ease of Use: Using dotenv is straightforward and requires minimal code. You only need to call require('dotenv').config() to load the variables from the .env file. Custom solutions may involve more code and complexity.

Community Support: dotenv is a widely used and well-maintained library with community support. It's actively developed and tested, ensuring that it works seamlessly with different Node.js projects. If you create your own solution, you'll need to maintain and test it yourself.

Integration with Deployment Tools: Many deployment and hosting platforms provide native support for loading environment variables from a .env file. Using dotenv can make it easier to integrate your Node.js application with such platforms.
*/

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const md5 = require('md5');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect('mongodb+srv://admin:H8gVgrtTkTOAT27A@cluster0.zirtemd.mongodb.net/userData');

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

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
            password: md5(req.body.password)
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

        if (userD.password === md5(password)) {
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