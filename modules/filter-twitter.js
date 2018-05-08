const R = require('ramda');
const {tweetTime, dmTime} = require('./tweet-time');

const dotPath = R.useWith(R.path, [R.split('.')]);
const deepPath = R.useWith(R.juxt, [R.map(dotPath)]);

const makeImagesBigger = R.replace(/_normal./, '_bigger.');
const appendAt = R.pipe(R.prepend('@'), R.join(''));
const findUser = R.curry((users, id) => R.find(R.propEq('id_str', id), users));

const evolvedTweet = {
    created_at: tweetTime,
    user: {
        screen_name: appendAt,
        profile_image_url_https: makeImagesBigger
    }
};

const evolvedFriend = {
    screen_name: appendAt,
    profile_image_url_https: makeImagesBigger
};

const findContact = user => R.pipe(
    R.nth(0), 
    R.props(['recipient', 'sender']), 
    R.symmetricDifferenceWith(R.eqBy(R.prop('id_str')), [user]),
    R.head
);

const specMessage = (users, self) => ({
    created_timestamp: R.pipe(R.prop('created_timestamp'), parseInt, dmTime),
    recipient: R.pipe(R.path(['message_create', 'target', 'recipient_id']), findUser(R.prop('data', users))),
    sender: R.pipe(R.path(['message_create', 'sender_id']), findUser(R.prop('data', users))),
    isSenderUser: R.pipe(R.path(['message_create', 'sender_id']), R.equals(self.id_str)),
    text: R.path(['message_create', 'message_data', 'text'])
});

const specConver = user => ({
    contact: findContact(user),
    messages: R.identity
});

const checkIds = R.curry((ids, list) => R.pipe(
    R.map(deepPath(['recipient.id_str', 'sender.id_str'])),
    R.map(R.map(R.contains(R.__, ids))), 
    R.map(R.all(R.equals(true))),
    R.head,
)(list));

const groupIntoConvos = (acc, message) => {
    const {recipient, sender} = message;
    const ids = [recipient.id_str, sender.id_str];
    const index = R.findIndex(checkIds(ids), acc);
    return index !== -1 ? R.adjust(R.append(message), index, acc) : [...acc, [message]];
};

const checkTweet = R.pipe(
    R.when(R.has('retweeted_status'), R.prop('retweeted_status')),
    R.evolve(evolvedTweet)
);

const checkTweets = R.pipe(
    R.prop('data'),
    R.map(checkTweet)
);

const checkFriends = R.pipe(
    R.path(['data', 'users']),
    R.map(R.evolve(evolvedFriend))
);

const checkSelf = R.pipe(
    R.prop('data'),
    R.evolve(evolvedFriend)
);

const checkPostTweet = R.pipe(
    R.prop('data'), 
    checkTweet
);

const getIdsFromMessages = R.pipe(
    R.path(['data', 'events']),
    R.map(R.prop('message_create')),
    R.map(deepPath(['target.recipient_id', 'sender_id'])),
    R.flatten,
    R.uniq,
    R.join(',')
);

const checkMessages = (messages, users, self) => R.pipe(
    R.path(['data', 'events']),
    R.take(5),
    R.map(R.applySpec(specMessage(users, self.data))),
    R.reduce(groupIntoConvos, []),
    R.map(R.reverse),
    R.map(R.applySpec(specConver(self.data)))
    //R.map(R.assoc('user', self.data))
)(messages);

module.exports = {checkTweets, checkFriends, checkSelf, checkMessages, getIdsFromMessages, checkPostTweet};
