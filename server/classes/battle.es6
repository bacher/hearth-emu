
const _ = require('lodash');

module.exports = class Battle {
    constructor(player1, player2) {
        this.status = 'waiting';

        this.players = _.shuffle([player1, player2]);

        this.bindListeners();
    }

    start() {
        console.log('Battle starting');

        this.status = 'starting';

        this.sendMessage('battle-started');

        setTimeout(() => {
            this.status = 'game';

            this.players[0].hero.addCrystal();
            this.players[0].activate();
            this.players[0].drawCard();
            this.players[0].drawCard();
            this.players[0].drawCard();

            this.players[1].drawCard();
            this.players[1].drawCard();
            this.players[1].drawCard();
            this.players[1].drawCard();
            this.players[1].addCoinCard();

            this.sendGameData();

        }, 500);
    }

    sendMessage(msg, json) {
        this.players.forEach(player => {
            player.sendMessage(msg, json);
        });
    }

    sendGameData() {
        const p1data = this.players[0].getGameData();
        const p2data = this.players[1].getGameData();

        this.players[0].sendMessage('game-data', {
            my: p1data,
            op: p2data
        });

        this.players[1].sendMessage('game-data', {
            my: p2data,
            op: p1data
        });
    }

    bindListeners() {
        const p1 = this.players[0];
        const p2 = this.players[1];

        p1.on('message', msg => {
            this.handlePlayerMessage(p1, msg.msg, msg.data);
        });

        p2.on('message', msg => {
            this.handlePlayerMessage(p2, msg.msg, msg.data);
        });
    }

    handlePlayerMessage(player, message, data) {
        switch (message) {
            case 'playCard':
                console.log('handler: playCard');
                console.log(data);
                data.info.act(data.info, this, player);
                break;
            case 'updateClients':
                this.sendGameData();
                break;
        }
    }

    getPlayers() {
        if (this.players[0].active) {
            return this.players;
        } else {
            return [this.players[1], this.players[0]];
        }
    }

    switchTurn() {
        const players = this.getPlayers();

        players[0].deactivate();

        players[1].activate();
        players[1].hero.addCrystal();
        players[1].hero.restoreMana();
        players[1].drawCard();
    }
};
