var express = require('express');
var router = express.Router();
router.use('/user', router);
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require("../models/Users");

function generateToken( params = {}){
    return jwt.sign( params, process.env.JWT_SECRET, {
        expiresIn: 86400
    });
}

/* GET users listing. */
router.get('/', async (req, res, next) => {

  const users = await User.find({});

  res.send(users);
});


router.get('/auth', async (req, res, next) => {
  const { email, password} = req.body;
    const user = await User.findOne({email}).select('+password'); 

    if (!user)
        return res.status(400).send({error: 'User or Password incorrect.'});

    if (!await bcrypt.compare(password, user.password))
        return res.status(400).send({error: 'User or Password incorrect.'});

    user.password = undefined;
    res.send({
        user, 
        token: generateToken({id: user.id})
    });
});


module.exports = router;
