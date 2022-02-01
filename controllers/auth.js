const routes = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const COMPANY_ID = '61f006d9dbbe16801b79bd37';

function generateToken( params = {}){
    return jwt.sign( params, process.env.JWT_SECRET, {
        expiresIn: 86400 //seconds = 24 hours
    });
}

routes.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
    try {

        if (!name) return res.status(400).send({ error: 'Name is required.', field: 'name'});
        if (!email) return res.status(400).send({ error: 'Email address is required.', field: 'email'});
        if (!password) return res.status(400).send({ error: 'Password is required.', field: 'password'});

        if (await User.findOne({email}))
            return res.status(400).send({ error: 'The email address is already in use.'})

        const userData = {
            ...req.body,
            role: 'employee',
            companyId: COMPANY_ID
        }

        const user = await User.create(userData);

        user.password = undefined;
        user.token = generateToken({id: user.id});
        return res.status(200).send(user);
    } catch (error) {
        console.log('error: ', error)
        return res.status(409).send({ error: 'Registration failed.'})
    }
    
});

routes.post('/authenticate', async (req, res) => {
    const { email, password} = req.body;
    const user = await User.findOne({email}).select('+password'); 
    const AUTH_MESSAGE_ERROR = 'User or Password incorrect.';


    if (!user)
        return res.send({error: AUTH_MESSAGE_ERROR});

    if (!await bcrypt.compare(password, user.password))
        return res.send({error: AUTH_MESSAGE_ERROR});

    user.password = undefined;
    user.token = generateToken({id: user.id});
    res.send(user);

});


module.exports = routes;