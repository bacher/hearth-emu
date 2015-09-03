
const fs = require('fs');
const _ = require('lodash');

const H = require('../namespace');

H.Battle = class Battle {
    constructor(player1, player2) {
        this.players = _.shuffle([player1, player2]);
        this.p1 = this.players[0];
        this.p2 = this.players[1];

        this.auras = new H.Auras();

        this._bindListeners();

        player1.enterBattle(this);
        player2.enterBattle(this);

        setTimeout(() => {
            this._start();
        }, 1000);
    }

    _start() {
        const p1Info = {
            name: this.p1.joinParams.name,
            clas: this.p1.hero.clas
        };

        const p2Info = {
            name: this.p2.joinParams.name,
            clas: this.p2.hero.clas
        };

        this.p1.sendMessage('battle-started', {
            my: p1Info,
            op: p2Info
        });

        this.p2.sendMessage('battle-started', {
            my: p2Info,
            op: p1Info
        });

        setTimeout(() => {
            this._sendCardsForRepick();
        }, 1000);
    }

    _sendCardsForRepick() {
        var cards = this.p1.deck.showLastCards(3);
        this.p1.startingCardCount = 3;
        this.p1.sendMessage('cards-for-repick', cards);

        cards = this.p2.deck.showLastCards(4);
        this.p2.startingCardCount = 4;
        this.p2.sendMessage('cards-for-repick', cards);
    }

    _start2() {
        this.p1.hero.addCrystal();
        this.p1.hero.restoreMana();
        this.p1.activate();
        this.p1.drawCard();
        this.p1.drawCard();
        this.p1.drawCard();
        this.p1.drawCard();

        this.p2.drawCard();
        this.p2.drawCard();
        this.p2.drawCard();
        this.p2.drawCard();
        this.p2.hand.addCoinCard();

        this.sendGameData();
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

    _bindListeners() {
        const player1 = this.players[0];
        const player2 = this.players[1];

        player1.on('message', msg => {
            this._handlePlayerMessage(player1, msg.msg, msg.data);
        });

        player2.on('message', msg => {
            this._handlePlayerMessage(player2, msg.msg, msg.data);
        });
    }

    _handlePlayerMessage(player, msg, data) {
        switch (msg) {
            case 'cards-replaced':
                if (this.p1.flags['deck'] && this.p2.flags['deck']) {
                    this._start2();
                }
                break;

            case 'play-card':
                data.handCard.base.acts.forEach(actInfo => {
                    actInfo.act({
                        params: data,
                        actParams: actInfo.params,
                        player
                    });
                });
                break;

            case 'end-turn':
                this.switchTurn();
                this.sendGameData();
                break;

            case 'update-clients':
                this.sendGameData();
                break;

            case 'hit':
                const enemy = player.getEnemy();

                if (data.by !== 'hero') {
                    const my = player.creatures.getCreatureByCrid(data.by);

                    if (data.target === 'hero') {
                        const opHero = player.enemy.hero;

                        if (opHero.hp <= my.attack) {
                            console.log('DEATH');
                        } else {
                            opHero.hp -= my.attack;
                        }

                    } else {
                        //FIXME: add targetSide condition
                        const op = enemy.creatures.getCreatureByCrid(data.target);

                        enemy.creatures.killCreature(op);
                    }

                    my.flags.tired = true;
                }

                this.sendGameData();

                break;

            case 'get-targets':
                const cardId = data.cardId;
                const creatureId = data.creatureId;

                if (cardId) {
                    const handCard = player.hand.getHandCard(cardId);

                    let targets;

                    if (handCard.base.getTargets) {
                        targets = handCard.base.getTargets({
                            battle: this,
                            player,
                            handCard
                        });
                    } else {
                        targets = 'not-need';
                    }

                    player.sendMessage('targets', {
                        cardId: cardId,
                        targets: targets
                    });
                } else if (creatureId) {
                    const creature = player.creatures.getCreatureByCrid(creatureId);
                    let targets = H.TARGETS['physic'](this, player, creature);

                    targets.op.minions = targets.op.minions.map(minion => minion.id);

                    player.sendMessage('targets', {
                        creatureId: creatureId,
                        targets: targets
                    });
                }
                break;

            case 'use-hero-skill': {
                player.hero.useSkill(this, player, data);

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
