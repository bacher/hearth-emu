const express = require('express');
const bodyParser = require('body-parser');

const PlayerWaiter = require('./player-waiter');

const app = express();

app.use(bodyParser.json());

app.use(express.static('../www'));

app.get('/cards.json', (req, res) => {
    res.json({
        ok: true,
        cards: [
            {
                name: 'Chillwind Yeti',
                cost: 4,
                type: 'minion',
                rarity: 0,
                category: 'neutral',
                img: 'cards/chillwind_yeti.png'
            }
        ]
    });
});

const server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

    new PlayerWaiter().listenWs();

});
