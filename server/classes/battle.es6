
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

        this.players.forEach(player => {
            player.on('client-message', msg => {
                this._handleClientMessage(player, msg.msg, msg.data);
            });

            player.on('message', msg => {
                this._handlePlayerMessage(player, msg.msg, msg.data);
            });
        });
    }

    _handlePlayerMessage(player, msg, data) {
        switch (msg) {
            case 'end-turn':
                this.switchTurn();
                this.sendGameData();
                break;

            case 'update-clients':
                this.sendGameData();
                break;

            case 'cards-replaced':
                if (this.p1.flags['deck'] && this.p2.flags['deck']) {
                    this._start2();
                }
                break;
            case 'death':
                //
                console.log('BATTLE END');
                break;
        }
    }

    _handleClientMessage(player, msg, data) {
        switch (msg) {
            case 'play-card':
                this._playCard(player, data);
                break;

            case 'hit':
                this._hit(player, data);
                break;

            case 'get-targets':
                this._getTargets(player, data);
                break;

            case 'use-hero-skill': {
                var heroSkill = player.hero.heroSkill;

                player.hero.mana -= 2;
                player.hero.skillUsed = true;

                var targets = null;

                if (heroSkill.skillTargetsType) {
                    targets = H.Targets.parseUserData(player, data);
                } else if (heroSkill.targetsType) {
                    targets = H.TARGETS.getByTargetsType(player, heroSkill.targetsType);
                }

                heroSkill.actFunc({
                    //params: data,
                    player,
                    battle: this,
                    targets
                });

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

    _getTargets(player, data) {
        const cardId = data.cardId;
        const creatureId = data.creatureId;

        var targets;

        if (cardId) {
            const handCard = player.hand.getCardById(cardId);

            if (handCard.base.targetsType) {
                targets = H.TARGETS
                    .getByTargetsType(player, handCard.base.targetsType)
                    .getGameData();
            } else {
                targets = 'not-need';
            }

            player.sendMessage('targets', {
                cardId,
                targets
            });
        } else if (creatureId === 'hero-skill') {
            targets = H.TARGETS
                .getByTargetsType(player, player.hero.heroSkill.skillTargetsType)
                .getGameData();

            player.sendMessage('targets', {
                creatureId,
                targets
            });
        } else if (creatureId) {
            targets = H.TARGETS.getTargets(player, 'physic').getGameData();

            player.sendMessage('targets', {
                creatureId,
                targets
            });
        }
    }

    _playCard(player, data) {
        const handCard = player.hand.getCardById(data.id);
        const card = handCard.base;

        player.hand.removeHandCard(handCard);
        player.hero.removeMana(card.cost);

        var cardTargets = null;

        if (card.targetsType) {
            cardTargets = H.Targets.parseUserData(player, data);
        }

        card.acts.forEach(act => {
            var targets;

            if (act.targetsType === 'not-need') {
                targets = null;
            } else if (act.targetsType) {
                const targetsType = act.targetsType;

                if (targetsType.names.length > 1 || targetsType.names[0] !== 'not-need') {
                    targets = H.TARGETS.getByTargetsType(player, targetsType);
                }

            } else {
                targets = cardTargets;
            }

            act.actFunc({
                params: data,
                player,
                battle: this,
                targets: targets
            });
        });

        this.sendGameData();
    }

    _hit(player, data) {
        const enemy = player.getEnemy();

        const by = data.by === 'hero' ?
            player.hero :
            player.creatures.getCreatureByCrid(data.by);

        //FIXME: add targetSide condition
        if (data.target === 'hero') {
            const opHero = enemy.hero;

            if (opHero.hp <= by.attack) {
                console.log('DEATH');
            } else {
                opHero.hp -= by.attack;
            }
        } else {
            const op = enemy.creatures.getCreatureByCrid(data.target);

            op.dealDamage(by.attack);
        }

        by.flags['tired'] = true;

        this.sendGameData();
    }
};
