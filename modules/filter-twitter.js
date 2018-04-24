const R = require('ramda');
const tweetTime = require('./tweet-time');

const evolvedTweet = {
    created_at: tweetTime,
    user: {
        profile_image_url_https: R.replace(/_normal./, '_bigger.')
    }
}

const testTweet = {
    created_at: R.pipe(R.prop('created_at'), tweetTime),
    text: R.prop('text'),
    user: {
        name: R.path(['user', 'name']),
        screen_name: R.path(['user', 'screen_name']),
        profile_image_url_https: R.pipe(
            R.path(['user', 'profile_image_url_https']), 
            R.replace(/_normal./, '_bigger.')
        )
    },
    retweet_count: R.prop('retweet_count'),
    favorite_count: R.prop('favorite_count')
};

const checkTweet = R.pipe(
    R.when(R.has('retweeted_status'), R.prop('retweeted_status')),
    R.evolve(evolvedTweet)
);

const checkTweets = R.pipe(
    R.prop('data'),
    R.map(checkTweet)
);

module.exports = {checkTweets};
