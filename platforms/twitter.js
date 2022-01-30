const axios = require('axios');
const User = require('../models/Users');
const Post = require('../models/Posts');
const PlatformBase = require('./platformBase');
const {
    getOAuthRequestToken,
    getOAuthAccessTokenWith,
    oauthGetUserById
} = require('../utilities/oauthTwitterUtility');
const Oauth1Helper = require('../utilities/Oauth1Helper');

class Instagram extends PlatformBase {

    constructor(){
        super('');
    }

    signin = async (userId) => {
        const { oauthRequestToken, oauthRequestTokenSecret } = await getOAuthRequestToken()
        const authorizationUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthRequestToken}`
        const twitterUserData = {
            twitter: {
                oauthRequestToken,
                oauthRequestTokenSecret,
                authorizationUrl
            }
        }
        await User.updateOne( { _id: userId }, { ...twitterUserData });
        return twitterUserData;
    }

    signInCallback = async (userId, oauthVerifier) => {
        const user = await User.findById(userId)
        const { oauthRequestToken, oauthRequestTokenSecret } = user.twitter
    
        const { oauthAccessToken, oauthAccessTokenSecret, results } = await getOAuthAccessTokenWith({ oauthRequestToken, oauthRequestTokenSecret, oauthVerifier })
    
        const { user_id: twitterUserId /*, screen_name */ } = results
        const userTwitter = await oauthGetUserById(twitterUserId, { oauthAccessToken, oauthAccessTokenSecret })
    
        const twitterUserData = {
            twitter: {
                ...user.twitter,
                userId: twitterUserId,
                userIdInternal: userTwitter.id,
                screenName: userTwitter.screen_name,
                name: userTwitter.name,
                photo: userTwitter.profile_image_url,
                oauthAccessToken,
                oauthAccessTokenSecret
            }
        }
    
        await User.updateOne( { _id: userId }, { ...twitterUserData });
        return twitterUserData;
    }

    post = async (userId, postData) => {
        try {
            const user = await User.findById(userId)
            const request = {
                url: 'https://api.twitter.com/2/tweets',
                method: 'POST',
                body: { text: postData }
             };
            const headers = Oauth1Helper.getAuthHeaderForRequest( {
                request, 
                keyConsumer: process.env.TWITTER_CONSUMER_API_KEY, 
                secretConsumer: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
                accessToken: user.twitter.oauthAccessToken,
                accessTokenSecret: user.twitter.oauthAccessTokenSecret
            });
            const response = await axios.post(request.url, request.body, { headers });
            await Post.create({
                userId,
                platformId: 'twitter',
                platformPostId: response.data.data.id.toString(),
                status: 'approved',
                text: postData
            })
            return response.data;

        } catch (error) {
            console.log(error);
        }
    }

    refreshSummary = async (userId) => {
        //todo...
    }

}

module.exports = new Instagram();