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

const checkIfError = R.when(
    R.either(R.path(['data', 'errors']), R.propSatisfies(R.isNil, 'resp')), 
    throwError
);

module.exports = {validateTweetText, checkIfError};
