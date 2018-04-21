const express = require('express');
const twit = require('twit');
const R = require('ramda');
const {join} = require('path');
const config = require('./config');

const app = express();
const T = new twit(config);

const options = {count: 5};
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', process.env.PORT || 3000);

app.use(express.static(join(__dirname, 'public')));

const neededTweetProps = ['created_at', 'text', 'user', 'retweet_count', 'favorite_count'];
const neededUserProps = ['name', 'screen_name', 'profile_image_url_https'];

const test = R.pipe(
    R.prop('data'),
    R.map(R.when(R.has('retweeted_status'), R.prop('retweeted_status'))),
    R.map(R.pick(neededTweetProps)),
    R.map(R.evolve({user: R.pick(neededUserProps)}))
);

app.get('/', async (req, res) => {
    const getTweets = T.get('statuses/user_timeline', options);

    const [tweets] = await Promise.all([getTweets]);

    console.log(test(tweets));

    res.render('index');
});

app.listen(app.get('port'));
