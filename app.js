const express = require('express');
const bodyParser = require('body-parser');
const twit = require('twit');
const R = require('ramda');
const {validateTweetText, checkIfError} = require('./modules/validate');
const errorLogger = require('./modules/logger');
const {join} = require('path');
const config = require('./config');

const {
    checkTweets, 
    checkFriends,
    checkSelf,
    checkMessages,
    getIdsFromMessages,
    checkPostTweet,
    checkScreenName
} = require('./modules/filter-twitter');

/**
 * Express router and set up for client routes.
 * @module app
 * @requires express
 * @requires body-parser
 * @requires twit
 * @requires ramda
 * @requires module:modules/validate
 * @requires module:modules/logger
 * @requires module:modules/filter-twitter
 * @requires path
 * @requires ./config
 */

const app = express();
const T = new twit(config);

/**
 * Options object for Twitter's tweets
 * @const
 * @type {Object}
 */
const tweetsOptions = {count: 5};

/**
 * Options object for Twitters's friends
 * @const
 * @type {Object}
 */
const friendsOptions = {
    count: 5, 
    skip_status: true, 
    include_user_entities: false
};

/**
 * Options object for Twitter's users
 * @const
 * @type {Object}
 */
const selfOptions = {
    include_entities: false,
    skip_status: true,
    include_email: false
};

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', process.env.PORT || 3000);

app.use(express.static(join(__dirname, 'public')));
app.use(bodyParser.json());

/**
 * Main route to comunicate with Twitter to properly display all of user's
 * data.
 *
 * @name get/
 * @function
 * @memberof module:app
 * @inner
 * @param {string} path
 * @param {callback} middlewear
 */
app.get('/', async (req, res, next) => {
    try {
        const getTweets = T.get('statuses/user_timeline', tweetsOptions);
        const getFriends = T.get('friends/list', friendsOptions);
        const getMessages = T.get('direct_messages/events/list');
        const getSelf = T.get('account/verify_credentials');

        const [tweets, friends, messages, self] = await Promise
            .all([getTweets, getFriends, getMessages, getSelf])
            .then(R.forEach(checkIfError))

        const usersIds = getIdsFromMessages(messages);
        let users = [];
        
        if (usersIds !== '') {
            users = await T.get('users/lookup', {user_id: usersIds})
                .then(checkIfError);
        }
        
        const render = {
            tweets: checkTweets(tweets),
            friends: checkFriends(friends),
            user: checkSelf(self),
            conversations: checkMessages(messages, users, self)
        }

        res.render('index', render);
    } catch(e) {
        next(e);
    }
});

/**
 * POST route used to post a tweet to Twitter.
 *
 * @name post/post-tweet
 * @function
 * @memberof module:app
 * @inner
 * @param {string} path
 * @param {callback} middlewear
 */
app.post('/post-tweet', async ({body: {status = ''}}, res) => {
    if (validateTweetText(status)) {
        try {
            const tweet = await T.post('statuses/update', {status})
                .then(checkIfError);
            return res.json(checkPostTweet(tweet));
        } catch(e) {
            errorLogger.error(e);
            res.status(500);
            res.json({message: 'Could not post your tweet at this time.'});
        }
    }
    
    res.status(500);
    res.json({message: 'Invalid Tweet!'});
});

/**
 * POST route used to unfollow a friend on Twitter.
 *
 * @name post/unfollow
 * @function
 * @memberof module:app
 * @inner
 * @param {string} path
 * @param {callback} middlewear
 */
app.post('/unfollow', async ({body: {screenName}}, res) => {
    try {
        const unfollower = await T.post('friendships/destroy', {screen_name: checkScreenName(screenName)})
            .then(checkIfError);
        res.json(unfollower);
    } catch(e) {
        errorLogger.error(e);
        res.status(500);
        res.json({message: `Could not unfollow ${screenName} at this time.`});
    }
});

/**
 * POST route used to follow a friend on Twitter.
 *
 * @name post/follow
 * @function
 * @memberof module:app
 * @inner
 * @param {string} path
 * @param {callback} middlewear
 */
app.post('/follow', async ({body: {screenName}}, res) => {
    try {
        const friend = await T.post('friendships/create', {screen_name: checkScreenName(screenName), follow: true})
            .then(checkIfError);
        res.json(friend);
    } catch(e) {
        errorLogger.error(e);
        res.status(500);
        res.json({message: `Could not follow ${screenName} at this time.`});
    }
});

/**
 * Middleware used to display if a communication error from Twitter exists.
 *
 * @function
 * @memberof module:app
 * @inner
 * @param {callback} middlewear
 */
app.use((err, req, res, next) => {
    errorLogger.error(err);
    res.status(500);
    res.render('error', {message: 'Could not communicate with Twitter. Please try again.'});
});

/**
 * Middleware used to display if no possible routes were able to be found.
 *
 * @function
 * @memberof module:app
 * @inner
 * @param {callback} middlewear
 */
app.use((req, res) => {
    res.status(404);
    res.render('error', {message: 'Page Not Found'});
});

app.listen(app.get('port'));
