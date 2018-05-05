const R = require('ramda');
const {parseTweet} = require('twitter-text');

const validateTweetText = R.pipe(
    R.trim,
    parseTweet,
    R.prop('valid')
);

module.exports = {validateTweetText};
