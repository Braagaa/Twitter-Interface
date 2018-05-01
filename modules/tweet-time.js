const m = require('moment');

const second = 1e3;
const minute = 6e4;
const hour = 36e5;
const day = 864e5;

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
        ? `At ${date.format('h:m A')}` : now.year() === date.year()
        ? date.format('MMM D, h:m A') : date.format('MMM D YYYY, h:m A');
}

module.exports = {tweetTime, dmTime};
