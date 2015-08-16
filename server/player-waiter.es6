
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
            player.on('logged', () => {
                if (this.waitingPlayer) {
                    const battle = new Battle(this.waitingPlayer, player);

                    this.waitingPlayer.enterBattle(battle);
                    player.enterBattle(battle);

                    battle.start();
                    this.waitingPlayer = null;

                } else {
                    this.waitingPlayer = player;
                }
            });

        });
    }
};
