const express = require('express');
const {join} = require('path');

const app = express();

app.set('views', join(__dirname, 'views'));
app.set('view engine', 'pug');

app.set('port', process.env.PORT || 3000);

app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(app.get('port'));
