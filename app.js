const express = require('express');
const bodyParser = require('body-parser');
const twit = require('twit');
const {validateTweetText} = require('./modules/validate');
const {join} = require('path');
const config = require('./config');

const {
    checkTweets, 
    checkFriends,
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

app.get('/', async (req, res) => {
    const getTweets = T.get('statuses/user_timeline', tweetsOptions);
    const getFriends = T.get('friends/list', friendsOptions);
    const getMessages = T.get('direct_messages/events/list');
    const getSelf = T.get('account/verify_credentials');

    const [tweets, friends, messages, self] = await Promise
        .all([getTweets, getFriends, getMessages, getSelf]);
    
    const users = await T.get('users/lookup', {user_id: getIdsFromMessages(messages)});

    const interface = {
        tweets: checkTweets(tweets),
        friends: checkFriends(friends),
        user: self.data,
        conversations: checkMessages(messages, users, self)
    }
    res.render('index', interface);
});

app.post('/post-tweet', async ({body: {status = ''}}, res) => {
    if (validateTweetText(status)) {
        const tweet = await T.post('statuses/update', {status});
        return res.json(checkPostTweet(tweet));
    }
    res.json({secret: 'bitch'});
});

app.listen(app.get('port'));
