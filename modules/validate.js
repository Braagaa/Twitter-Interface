const R = require('ramda');
const {parseTweet} = require('twitter-text');

/**
 * Validater module for validating inputs from clients and responses from
 * servers.
 *
 * @module modules/validate
 * @requires ramda
 * @requires twitter-text
 */

/**
 * Function that throws its only argument. Most likely error objects.
 *
 * @param {*} err
 * @throws {*}
 */
const throwError = (err) => {
    throw err;
}

/**
 * Validates a clients Tweet text with the help of twitter-text module's
 * parseTweet function.
 *
 * @alias module:modules/validate.validateTweetText
 * @function
 * @param {string} text - Clients tweet text
 * @return {boolean}
 */
const validateTweetText = R.pipe(
    R.trim,
    parseTweet,
    R.prop('valid')
);

/**
 * Checks if a response from Twitters server is an error response. If it is,
 * it throws that object as an error.
 *
 * @alias module:modules/validate.checkIfError
 * @function
 * @param {Object} res - Response object
 * @returns {Object} - The same response object as the parameter
 * @throws {Object} - The same response object as the parameter
 */
const checkIfError = R.when(
    R.either(R.path(['data', 'errors']), R.propSatisfies(R.isNil, 'resp')), 
    throwError
);

module.exports = {validateTweetText, checkIfError};
