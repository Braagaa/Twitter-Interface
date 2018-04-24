const express = require('express');
const twit = require('twit');
const {join} = require('path');
const {checkTweets} = require('./modules/filter-twitter');
const config = require('./config');

const app = express();
const T = new twit(config);

const options = {count: 5};
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', process.env.PORT || 3000);

app.use(express.static(join(__dirname, 'public')));

app.get('/', async (req, res) => {
    const getTweets = T.get('statuses/user_timeline', options);

    const [tweets] = await Promise.all([getTweets]);

    res.render('index', {tweets: checkTweets(tweets)});
});

app.listen(app.get('port'));
