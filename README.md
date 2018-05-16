Twitter Interface
=================

A simple Express.js application that uses Twitter’s REST API to access your Twitter profile information and render it.

Configuration
-------------

You need to create a new Twitter application in order to generate the keys and access tokens needed to run this application. You can create one at <https://apps.twitter.com/>.

Create a file named __config.js__ in the main directory and create an Object with the following properties filled in:

```javascript
module.exports = {
    consumer_key: '...',
    consumer_secret: '...',
    access_token: '...',
    access_token_secret: '...'
};
```

Make sure that object is exported out of __config.js__.

Running the App
---------------

Once the configuration is set up, you can run it locally at port 3000 with __npm start__.
