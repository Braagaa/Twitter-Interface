const m = require('moment');

/**
 * Module that parses timestamps into Twitter time.
 * @module modules/tweet-time
 * @requires moment
 */

/**
 * A second in miliseconds
 * @const
 * @type {number}
 */
const second = 1e3;

/**
 * A minute in miliseconds
 * @const
 * @type {number}
 */
const minute = 6e4;

/**
 * An hour in miliseconds
 * @const
 * @type {number}
 */
const hour = 36e5;

/**
 * A day in miliseconds
 * @const
 * @type {number}
 */
const day = 864e5;

/**
 * A timestamp parser function used to parse Twitters Tweets.
 *
 * @alias module:modules/tweet-time.tweetTime
 * @function
 * @param {string} timestamp - A timestamp as a string
 * @returns {string} A timestamp fitting for the API
 */
const tweetTime = function(timestamp) {
    const now = m(new Date());
    const date = m(new Date(timestamp));
    const diff = now.diff(date);
    const duration = m.duration(diff);

    return diff <= second 
        ? '1s' : diff < minute
        ? `${duration.seconds()}s` : diff < hour
        ? `${duration.minutes()}m` : diff < day
        ? `${duration.hours()}h` : now.year() === date.year()
        ? date.format('MMM D') : date.format('MMM D YYYY');
}

/**
 * A timestamp parser function used to parse Twitters direct messages.
 *
 * @alias module:modules/tweet-time.dmTime
 * @function
 * @param {string} timestamp - A timestamp as a string
 * @returns {string} A timestamp fitting for the API
 */
const dmTime = function(timestamp) {
    const now = m(new Date());
    const date = m(new Date(timestamp));
    const diff = now.diff(date);
    const duration = m.duration(diff);

    return diff <= second 
        ? '1s' : diff < minute
        ? `${duration.seconds()}s ago` : diff < hour
        ? `${duration.minutes()}m ago` : diff < hour * 4
        ? `${duration.hours()}h ago` : diff < day
        ? `At ${date.format('h:mm A')}` : now.year() === date.year()
        ? date.format('MMM D, h:mm A') : date.format('MMM D YYYY, h:mm A');
}

module.exports = {tweetTime, dmTime};
