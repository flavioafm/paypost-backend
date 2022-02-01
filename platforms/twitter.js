const axios = require('axios');
const User = require('../models/Users');
const Post = require('../models/Posts');
const Medias = require('../models/Medias');
const PlatformBase = require('./platformBase');
const { TwitterApi } = require('twitter-api-v2');
const { download, getFullName } = require('../utilities/media');

class TwitterV2 extends PlatformBase {

    constructor(){
        super('');
    }

    signin = async (userId) => {
        const client = new TwitterApi({ 
            appKey: process.env.TWITTER_CONSUMER_API_KEY, 
            appSecret: process.env.TWITTER_CONSUMER_API_SECRET_KEY 
        });
        const authLink = await client.generateAuthLink(
            process.env.TWITTER_AUTH_CALLBACK, 
            { linkMode: 'authorize' }
        );
        const twitterUserData = {
            twitter: {
                oauthRequestToken: authLink.oauth_token,
                oauthRequestTokenSecret: authLink.oauth_token_secret,
                authorizationUrl: authLink.url
            }
        }
        await User.updateOne( { _id: userId }, { ...twitterUserData });
        return twitterUserData;
    }

    signInCallback = async (userId, oauthVerifier) => {
        const user = await User.findById(userId);
        const clientWithRequestToken = new TwitterApi({
            appKey: process.env.TWITTER_CONSUMER_API_KEY,
            appSecret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
            accessToken: user.twitter.oauthRequestToken,
            accessSecret: user.twitter.oauthRequestTokenSecret,
        });
        const response = await clientWithRequestToken.login(oauthVerifier);

        const clientWithAccessoToken = new TwitterApi({
            appKey: process.env.TWITTER_CONSUMER_API_KEY,
            appSecret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
            accessToken: response.accessToken,
            accessSecret: response.accessSecret,
        });
        const userTwitter = await clientWithAccessoToken.currentUser();
        const twitterUserData = {
            twitter: {
                ...user.twitter,
                userId: response.userId,
                screenName: response.screenName,
                name: userTwitter.name,
                photo: userTwitter.profile_image_url,
                oauthAccessToken: response.accessToken,
                oauthAccessTokenSecret: response.accessSecret
            }
        }
        await User.updateOne( { _id: userId }, { ...twitterUserData });
        return twitterUserData;
    }

    post = async (userId, postData) => {

        const user = await User.findById(userId);
        const client = new TwitterApi({
            appKey: process.env.TWITTER_CONSUMER_API_KEY,
            appSecret: process.env.TWITTER_CONSUMER_API_SECRET_KEY,
            accessToken: user.twitter.oauthAccessToken,
            accessSecret: user.twitter.oauthAccessTokenSecret,
        });
        
        let mediaIds = [];
        if (postData.photo) {
            await download(postData.photo);
            const photo = getFullName(postData.photo)
            mediaIds = await Promise.all([
                client.v1.uploadMedia(photo),
            ]);
        }

        const response = await client.v1.tweet(postData.text, { media_ids: mediaIds });

        let media = null;
        if (postData.photo) {
            media = new Medias({url: postData.photo,userId});
            await media.save();
        }
        await Post.create({
            userId,
            platformId: 'twitter',
            platformPostId: response.id.toString(),
            status: 'approved',
            text: postData.text,
            mediaId: media?._id || null
        })
        return response.data;
    }
}

module.exports = new TwitterV2();