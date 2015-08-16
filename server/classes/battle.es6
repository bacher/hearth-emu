
const fs = require('fs');
const _ = require('lodash');
const Auras = require('./auras');

module.exports = class Battle {
    constructor(player1, player2) {
        this.players = _.shuffle([player1, player2]);
        this.auras = new Auras();

        this.bindListeners();
    }

    start() {
        setTimeout(() => {
            if (this.players[0].flags.joined && this.players[1].flags.joined) {
                this.start2();
            } else {
                this.start();
            }
        }, 50);
    }

    start2() {
        this.sendMessage('battle-started');

        this.players[0].hero.addCrystal();
        this.players[0].hero.restoreMana();
        this.players[0].activate();
        this.players[0].drawCard();
        this.players[0].drawCard();
        this.players[0].drawCard();

        this.players[1].drawCard();
        this.players[1].drawCard();
        this.players[1].drawCard();
        this.players[1].drawCard();
        this.players[1].hand.addCoinCard();

        this.sendGameData();
    }

    sendMessage(msg, json) {
        this.players.forEach(player => {

            console.log(json);

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

    handlePlayerMessage(player, msg, data) {
        switch (msg) {
            case 'play-card':
                data.base.act(data.base, this, player);
                break;
            case 'end-turn':
                this.switchTurn();
                this.sendGameData();
                break;
            case 'update-clients':
                this.sendGameData();
                break;
            case 'hit-creature':
                const my = player.creatures.getCreatureByCrid(data.my);
                const op = this.getOp(player).creatures.getCreatureByCrid(data.op);

                op.flags.dead = true;
                my.flags.sleep = true;

                this.sendGameData();

                break;

            case 'hit-hero': {
                const my = player.creatures.getCreatureByCrid(data.my);

                const opHero = this.getOp(player).hero;

                if (opHero.hp <= my.attack) {

                } else {
                    opHero.hp -= my.attack;
                }

                my.flags.sleep = true;

                this.sendGameData();

                break;
            }
            case 'use-hero-skill': {
                player.hero.useSkill(this, player, this.getOpponent(player), data);

                this.sendGameData();
                break;
            }
            default:
                console.warn('Unhandled Player Message:', msg);
        }
    }

    getOpponent(player) {
        if (this.players[0] === player) {
            return this.players[1];
        } else {
            return this.players[0];
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
        players[1].creatures.wakeUpAll();
        players[1].hero.addCrystal();
        players[1].hero.restoreMana();
        players[1].hero.skillUsed = false;
        players[1].drawCard();
    }
};
