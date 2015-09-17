
const WebSocketServer = new require('ws');

const H = require('./namespace');

require('./constants');
require('./utils');

require('./classes/aura');
require('./classes/auras');
require('./classes/command');
require('./classes/commands');
require('./classes/battle');
require('./classes/targets');
require('./classes/card');
require('./classes/creatures');
require('./classes/traps');
require('./classes/deck');
require('./classes/hand');
require('./classes/hand-card');
require('./classes/game-object');
require('./classes/minion');
require('./classes/weapon');
require('./classes/trap');
require('./classes/hero');
require('./classes/heroes/warrior');
require('./classes/heroes/shaman');
require('./classes/heroes/rogue');
require('./classes/heroes/paladin');
require('./classes/heroes/hunter');
require('./classes/heroes/druid');
require('./classes/heroes/warlock');
require('./classes/heroes/mage');
require('./classes/heroes/priest');
require('./classes/player');

require('./activations');
require('./targets');
require('./cards');
require('./event-filters');
require('./custom-actions');
require('./conditions');
require('./basic-decks');


module.exports = class Game {
    constructor(app) {
        this.app = app;

        this.listenRequests();
        this.listenWebSockets();
    }

    listenRequests() {
        this.app.get('/cards.json', (req, res) => {
            res.json({
                ok: true,
                cards: H.CARDS.clientList
            });
        });
    }

    listenWebSockets() {
        this.waitingPlayer = null;

        this.wsServer = new WebSocketServer.Server({
            port: 8081
        });

        this.wsServer.on('connection', ws => {

            const player = new H.Player(ws);

            player.on('logged', () => {
                if (this.waitingPlayer && !this.waitingPlayer.flags['disconnected']) {
                    new H.Battle(this.waitingPlayer, player);

                    this.waitingPlayer = null;

                } else {
                    this.waitingPlayer = player;
                }
            });

        });
    }
};

