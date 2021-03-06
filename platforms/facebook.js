const axios = require('axios');
const User = require('../models/Users');
const Post = require('../models/Posts');
const Medias = require('../models/Medias');
const PlatformBase = require('./platformBase');
const URL_BASE = "https://graph.facebook.com";

class Facebook extends PlatformBase {

    constructor(){
        super(URL_BASE);
    }

    signin = async (userId, userData) => {
        try {
            /** Get user Long-Lived Token */
            const userLongLivedTokenUrl = `/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_CLIENT_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${userData.accessToken}`;
            const userLongLivedTokenResponse = await this.getRequest().get(userLongLivedTokenUrl);
            const userLongLivedToken = userLongLivedTokenResponse.data.access_token;

            /** Get page Long-Lived Token */
            const pageLongLivedTokenUrl = `/${userData.userID}/accounts?access_token=${userLongLivedToken}`;
            const pageLongLivedTokenResponse = await this.getRequest().get(pageLongLivedTokenUrl);
            const pageLongLivedToken = pageLongLivedTokenResponse.data.data[0].access_token;
            const userDataFacebook = {
                facebook: {
                    ...userData,
                    userLongLivedToken,
                    pageLongLivedToken
                }
            }

            await User.updateOne(
                { _id: userId },
                { ...userDataFacebook}
            )
            return userDataFacebook;
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    post = async (userId, postData) => {
        try {
            const user = await User.findById(userId)
            let url = null
            if (postData.photo) {
                url = `/${process.env.FACEBOOK_PAGE_ID}/photos?url=${postData.photo}&message=${postData.text}&access_token=${user.facebook.pageLongLivedToken}`;
            } else {
                url = `/${process.env.FACEBOOK_PAGE_ID}/feed?message=${postData.text}&access_token=${user.facebook.pageLongLivedToken}`;
            }
            const response = await this.getRequest().post(url); 
            
            let media = null;
            if (postData.photo) {
                media = new Medias({ url: postData.photo, userId});
                await media.save();
            }
            await Post.create({
                userId,
                platformId: 'facebook',
                platformPostId: response.data.id,
                status: 'approved',
                text: postData.text,
                mediaId: media?._id || null
            })
        } catch (error) {
            console.log(error);            
        }
    }
    
    refreshSummary = async (userId) => {
        try {
            const user = await User.findById(userId)
            if (!user.facebook) return;
            const url = `/${process.env.FACEBOOK_PAGE_ID}/posts?fields=likes.summary(true),shares.summary(true)&access_token=${user.facebook.pageLongLivedToken}`;
            const response = await this.getRequest().get(url);
            const summary = response.data;
            summary.data.map(async item => {
                await Post.updateOne({
                    platformPostId: item.id
                },{
                    likes: item?.likes?.summary?.total_count || 0,
                    shares: item?.shares?.count || 0
                })
            })
        } catch (error) {
            console.log(error);            
        }
    }
}
module.exports = new Facebook();