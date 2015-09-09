const express = require('express');
const bodyParser = require('body-parser');
require('colors');

const Game = require('./game');

const app = express();

app.use(bodyParser.json());

app.use(express.static('../www'));

const server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Hearthstone server listening %s:%s'.green, host, port);

    new Game(app);
});
