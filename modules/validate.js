const R = require('ramda');
const {parseTweet} = require('twitter-text');

const throwError = (err) => {
    throw err;
}

const validateTweetText = R.pipe(
    R.trim,
    parseTweet,
    R.prop('valid')
);

const checkIfError = R.when(R.path(['data', 'errors']), throwError);

module.exports = {validateTweetText, checkIfError};
