
const fs = require('fs');
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

const H = require('../namespace');

H.Battle = class Battle extends EventEmitter {
    constructor(player1, player2) {
        super();

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
                const card = data.handCard.base;
                var cardTargets = null;

                if (card.target !== 'not-need') {
                    cardTargets = new H.Targets({ player });

                    const targetPlayer = (params.targetSide === 'op' ? player.enemy : player);

                    if (params.target === 'hero') {
                        cardTargets.addHero(targetPlayer.hero);
                    } else {
                        const target = targetPlayer.creatures.getCreatureByCrid(params.target);

                        cardTargets.addMinion(target);
                    }
                }

                card.acts.forEach(act => {
                    var targets = null;

                    if (cardTargets) {
                        targets = cardTargets;
                    } else {
                        const targetsType = act.targetsType;

                        if (targetsType.names.length > 1 || targetsType.names[0] !== 'not-need') {

                            const allTargets = targetsType.names.map(name => H.TARGETS[name]({
                                player
                            }));

                            targets = allTargets.reduce((base, nextTarget) => {
                                return base[targetsType.mergeType](nextTarget);
                            });
                        }

                        if (targetsType.modificators) {
                            targetsType.modificators.forEach(mod => {
                                targets[mod.name](...mod.params);
                            });
                        }
                    }

                    act.actFunc({
                        params: data,
                        player,
                        battle,
                        targets: targets
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
                        targets: targets.getGameData()
                    });
                } else if (creatureId) {
                    let targets = H.TARGETS['physic']({
                        battle: this,
                        player
                    });

                    player.sendMessage('targets', {
                        creatureId: creatureId,
                        targets: targets.getGameData()
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

        this.emit('turn-end', players[0]);

        this.emit('turn-start', players[1]);
    }
};
