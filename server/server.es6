const express = require('express');
const bodyParser = require('body-parser');
require('colors');

const PlayerWaiter = require('./player-waiter');
const cards = require('./cards');

const app = express();

app.use(bodyParser.json());

app.use(express.static('../www'));

app.get('/cards.json', (req, res) => {
    res.json({
        ok: true,
        cards: cards.list
    });
});

const server = app.listen(8080, '192.168.1.66', function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Hearthstone server listening %s:%s'.green, host, port);

    new PlayerWaiter().listenWs();
});
