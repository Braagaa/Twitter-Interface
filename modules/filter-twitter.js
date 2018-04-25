const R = require('ramda');
const tweetTime = require('./tweet-time');

const makeImagesBigger = R.replace(/_normal./, '_bigger.');
const appendAt = R.pipe(R.prepend('@'), R.join(''));

const evolvedTweet = {
    created_at: tweetTime,
    user: {
        screen_name: appendAt,
        profile_image_url_https: makeImagesBigger
    }
};

const evolvedFriend = {
    screen_name: appendAt,
    profile_image_url_https: makeImagesBigger
};

const checkTweet = R.pipe(
    R.when(R.has('retweeted_status'), R.prop('retweeted_status')),
    R.evolve(evolvedTweet)
);

const checkTweets = R.pipe(
    R.prop('data'),
    R.map(checkTweet)
);

const getFriendsCount = R.pipe(
    R.prop('data'),
    R.nth(0),
    R.path(['user', 'friends_count'])
);

const checkFriends = R.pipe(
    R.path(['data', 'users']),
    R.map(R.evolve(evolvedFriend))
);

module.exports = {checkTweets, checkFriends, getFriendsCount};
