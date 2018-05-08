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
    checkPostTweet
} = require('./modules/filter-twitter');

const app = express();
const T = new twit(config);

const tweetsOptions = {count: 5};
const friendsOptions = {
    count: 5, 
    skip_status: true, 
    include_user_entities: false
};
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

app.get('/', async (req, res, next) => {
    try {
        const getTweets = T.get('statuses/user_timeline', tweetsOptions);
        const getFriends = T.get('friends/list', friendsOptions);
        const getMessages = T.get('direct_messages/events/list');
        const getSelf = T.get('account/verify_credentials');

        const [tweets, friends, messages, self] = await Promise
            .all([getTweets, getFriends, getMessages, getSelf])
            .then(R.forEach(checkIfError))
        
        const users = await T.get('users/lookup', {user_id: getIdsFromMessages(messages)})
            .then(checkIfError);

        const interface = {
            tweets: checkTweets(tweets),
            friends: checkFriends(friends),
            user: checkSelf(self),
            conversations: checkMessages(messages, users, self)
        }

        res.render('index', interface);
    } catch(e) {
        next(e);
    }
});

app.post('/post-tweet', async ({body: {status = ''}}, res) => {
    debugger;
    if (validateTweetText(status)) {
        try {
            const tweet = await T.post('statuses/update', {status})
                .then(checkIfError);
            return res.json(checkPostTweet(tweet));
        } catch(e) {
            errorLogger.error(e);
            res.json({error: {message: 'Could not post your tweet at this time.'}});
        }
    }

    res.json({error: {message: 'Invalid Tweet!'}});
});

app.use((err, req, res, next) => {
    errorLogger.error(err);
    res.status(500);
    res.render('error', {message: 'Could not communicate with Twitter. Please try again.'});
});

app.use((req, res) => {
    res.status(404);
    res.render('error', {message: 'Page Not Found'});
});

app.listen(app.get('port'));
