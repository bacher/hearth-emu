
const WebSocketServer = new require('ws');
const Player = require('./classes/player');
const Battle = require('./classes/battle');

module.exports = class PlayerWaiter {
    constructor() {
        this.waitingPlayer = null;
    }

    listenWs() {

        this.wsServer = new WebSocketServer.Server({
            port: 8081
        });

        this.wsServer.on('connection', ws => {

            const player = new Player(ws);

            if (this.waitingPlayer && this.waitingPlayer.status !== 'off') {
                new Battle(this.waitingPlayer, player).start();
                this.waitingPlayer = null;

            } else {
                this.waitingPlayer = player;
            }

        });
    }
};
