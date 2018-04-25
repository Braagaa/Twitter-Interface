const express = require('express');
const twit = require('twit');
const {join} = require('path');
const config = require('./config');

const {
    checkTweets, 
    checkFriends,
    getFriendsCount
} = require('./modules/filter-twitter');

const app = express();
const T = new twit(config);

const tweetsOptions = {count: 5};
const friendsOptions = {
    count: 5, 
    skip_status: true, 
    include_user_entities: false
};

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', process.env.PORT || 3000);

app.use(express.static(join(__dirname, 'public')));

app.get('/', async (req, res) => {
    const getTweets = T.get('statuses/user_timeline', tweetsOptions);
    const getFriends = T.get('friends/list', friendsOptions);

    const [tweets, friends] = await Promise
        .all([getTweets, getFriends]);
    
    const interface = {
        tweets: checkTweets(tweets),
        friends_count: getFriendsCount(tweets),
        friends: checkFriends(friends)
    }

    res.render('index', interface);
});

app.listen(app.get('port'));
