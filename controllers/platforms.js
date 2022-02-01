var express = require('express');
var router = express.Router();
router.use('/platform', router);
const Post = require('../models/Posts');
const Medias = require('../models/Medias');

const plataformList = {
    'facebook': require('../platforms/facebook'),
    'instagram': require('../platforms/instagram'),
    'twitter': require('../platforms/twitter')
}

router.post('/signin', async (req, res, next) => {
    const {userId, platformId, userData} = req.body;
    const platform = plataformList[platformId];
    const data = await platform.signin(userId, userData);
    res.send(data);
});

router.get('/signin_callback', async (req, res, next) => {
    const {userId, platformId, oauthVerifier} = req.query;
    const platform = plataformList[platformId];
    if ( typeof platform.signInCallback === "function") {
        const data = await platform.signInCallback(userId, oauthVerifier);
        return res.send({...data});
    } 
    res.send({});
});

router.post('/post', async (req, res, next) => {
    const {userId, platformId, postData} = req.body;
    const platform = plataformList[platformId];
    const data = await platform.post
    (userId, postData);
  
    res.send({...data});
});

router.get('/post', async (req, res, next) => {
    const { userId } = req.query;
    try {
        for (const key in plataformList) {
            const platform = plataformList[key];
            if ( typeof platform.refreshSummary === "function") {
                await platform.refreshSummary(userId);
            }
        }
        const posts = await Post.find({
            userId
        });
        res.send(posts);
    } catch (error) {
        console.log(error);            
    }
});

router.get('/media', async (req, res, next) => {
    const { userId } = req.query;
    const medias = await Medias.find({
        userId
    });
    res.send(medias);
});


module.exports = router;