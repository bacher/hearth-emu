
const WebSocketServer = new require('ws');

const H = require('./namespace');
const importTools = require('./import-tools/import');

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
require('./classes/hero-skill');
require('./classes/hero');
require('./classes/energy');
require('./classes/heroes/warrior');
require('./classes/heroes/shaman');
require('./classes/heroes/rogue');
require('./classes/heroes/paladin');
require('./classes/heroes/hunter');
require('./classes/heroes/druid');
require('./classes/heroes/warlock');
require('./classes/heroes/mage');
require('./classes/heroes/priest');
require('./classes/heroes/jaraxxus');
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

        this.app.get('/import.json', (req, res) => {
            importTools.extract(req.query.url)
                .then(deck => {
                    res.json({
                        ok: true,
                        deck: deck
                    });
                })
                .catch(e => {
                    console.warn('Import error:', e);

                    res.json({
                        ok: false
                    });
                });
        });

        const online = {};
        var onlineCount = 0;

        setInterval(() => {
            onlineCount = 0;
            const last = Date.now() - 60000;

            for (var id in online) {
                if (online[id] < last) {
                    delete online[id];
                } else {
                    onlineCount++;
                }
            }
        }, 5000);

        this.app.post('/iamalive.json', (req, res) => {
            online[req.query.id] = Date.now();
            res.end();
        });

        this.app.get('/online.json', (req, res) => {
            res.json({
                online: Math.max(onlineCount, 1)
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

