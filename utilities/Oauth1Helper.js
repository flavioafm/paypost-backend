const crypto = require('crypto-js');
const oauth1a = require('oauth-1.0a');

// const CONSUMERKEY = process.env.TWITTER_CONSUMER_API_KEY;
// const CONSUMERSECRET = process.env.TWITTER_CONSUMER_API_SECRET_KEY;

class Oauth1Helper {
    static getAuthHeaderForRequest( reqKeysAndSecrets ) {
        const oauth = oauth1a({
            consumer: { 
                key: reqKeysAndSecrets.keyConsumer, 
                secret: reqKeysAndSecrets.secretConsumer 
            },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                return crypto.algo.HMAC
                    .create(crypto.algo.SHA1, key)
                    .update(base_string)
                    .finalize()
                    .toString(crypto.enc.Base64);
            }
        });

        const authorization = oauth.authorize(reqKeysAndSecrets.request, {
            key: reqKeysAndSecrets.accessToken,
            secret: reqKeysAndSecrets.accessTokenSecret,
        });

        return oauth.toHeader(authorization);
    }
}

module.exports = Oauth1Helper;