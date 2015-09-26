
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

        this._actions = [];

        this.auras = new H.Auras(this);

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
            clas: this.p1.hero.clas,
            id: this.p1.id,
            heroId: this.p1.hero.id
        };

        const p2Info = {
            name: this.p2.joinParams.name,
            clas: this.p2.hero.clas,
            id: this.p2.id,
            heroId: this.p2.hero.id
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
        this.p1.sendMessage('cards-for-repick', extractInfo(cards));

        cards = this.p2.deck.showLastCards(4);
        this.p2.startingCardCount = 4;
        this.p2.sendMessage('cards-for-repick', extractInfo(cards));

        function extractInfo(cards) {
            return cards.map(deckCard => {
                return {
                    id: deckCard.id,
                    pic: deckCard.card.pic
                };
            });
        }
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

    addBattleAction(action) {
        this._actions.push(action);
    }

    sendGameData() {
        const p1data = this.players[0].getGameData();
        const p2data = this.players[1].getGameData();

        this.players[0].sendMessage('game-data', {
            my: p1data,
            op: p2data,
            actions: this._actions
        });

        this.players[1].sendMessage('game-data', {
            my: p2data,
            op: p1data,
            actions: this._actions
        });

        this._actions = [];
    }

    _bindListeners() {
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
            case 'burn-card':
                player.sendMessage('burn-card', {
                    side: 'my',
                    cardPic: data.pic
                });

                player.sendMessage('burn-card', {
                    side: 'op',
                    cardPic: data.pic
                });

                break;
            case 'defeat':
                player.sendMessage('defeat');
                player.enemy.sendMessage('win');

                setTimeout(() => {
                    player.closeSocket();
                    player.enemy.closeSocket();
                }, 100);

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
                this._useHeroSkill(player, data);
                break;
            }
            case 'chat-emotion': {
                player.enemy.sendMessage('chat-emotion', {
                    text: data
                });
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

        this.emit('end-turn', players[0]);

        this.emit('start-turn', players[1]);
    }

    _getTargets(player, data) {
        const cardId = data.cardId;
        const realCardId = data.realCardId;
        const creatureId = data.creatureId;

        var targets;

        if (cardId || realCardId) {

            var card;

            if (cardId) {
                card = player.hand.getCardById(cardId).base;
            } else {
                card = H.CARDS.getById(realCardId);
            }

            if (card.targetsType) {
                targets = H.TARGETS
                    .getByTargetsType(player, card.targetsType)
                    .removeHiddenEnemies()
                    .getGameData();
            } else {
                targets = 'not-need';
            }

            player.sendMessage('targets', {
                cardId, // FIXME not used
                targets
            });

        } else if (creatureId === 'hero-skill') {
            targets = H.TARGETS.getByTargetsType(player, player.hero.heroSkillTargets)
                .removeHiddenEnemies()
                .getGameData();

            player.sendMessage('targets', {
                creatureId,  // FIXME not used
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
        const handCardInfo = handCard.getData();
        const card = handCardInfo.base;

        player.hand.removeHandCard(handCard);
        player.hero.removeMana(handCardInfo.cost);

        this._activateCard(player, handCard, card, data);

        this.addBattleAction({
            name: 'play-card',
            player: player.id,
            card: {
                pic: handCardInfo.base.pic,
                cost: handCardInfo.cost
            }
        });

        const origBaseCard = handCard.base;

        if (origBaseCard.additionActions) {
            const additionCard = _.find(origBaseCard.additionActions, { id: data.choosenCard.id });

            var minion;
            if (card.type === H.CARD_TYPES.minion) {
                minion = handCard.minion;
            }

            this._activateCard(player, null, additionCard, data.choosenCard, minion);
        }

        this.sendGameData();
    }

    _activateCard(player, handCard, card, data, minion) {
        const globalTargets = card.targetsType ? H.Targets.parseUserData(player, data) : null;

        const eventMessage = {
            player,
            handCard,
            globalTargets,
            prevent: false
        };

        this.emit('play-card', eventMessage);

        if (!eventMessage.prevent) {
            if (card.customAction) {
                H.CustomActions.getByName(card.customAction)({
                    player
                });
            } else {
                card.acts.act({
                    battle: this,
                    player,
                    handCard,
                    handCardInfo: handCard && handCard.getData(),
                    minion: minion,
                    params: data,
                    globalTargets: eventMessage.globalTargets
                });
            }
        }
    }

    _hit(player, data) {
        const by = this.getObjectById(data.by);

        const targets = H.Targets.parseUserData(player, data);

        targets.forEach(target => {
            const eventMessage = {
                by: by,
                to: target,
                prevent: false
            };

            this.emit('hit', eventMessage);

            if (!eventMessage.prevent) {
                const counterAttack = eventMessage.to.getData().attack;

                eventMessage.to.dealDamage(eventMessage.by.getData().attack);

                this.addBattleAction({
                    name: 'hit',
                    by: by.id,
                    to: target.id
                });

                if (counterAttack) {
                    eventMessage.by.dealDamage(counterAttack);
                }
            }
        });
        by.setHitFlags();

        this.sendGameData();
    }

    _useHeroSkill(player, data) {
        const hero = player.hero;
        const heroSkill = hero.heroSkill;

        player.hero.mana -= 2;
        player.hero.skillUsed = true;

        var globalTargets = null;

        if (heroSkill.skillNeedTarget) {
            globalTargets = H.Targets.parseUserData(player, data);
        }

        this.addBattleAction({
            name: 'use-hero-skill',
            player: player.id
        });

        hero.useHeroSkill({
            battle: this,
            player,
            handCard: null,
            globalTargets,
            params: null
        });

        this.sendGameData();
    }

    getObjectById(id) {
        const p1 = this.p1;
        const p2 = this.p2;

        if (_.startsWith(id, 'minion')) {
            const minion = p1.creatures.getCreatureById(id);

            if (minion) {
                return minion;
            } else {
                return p2.creatures.getCreatureById(id);
            }

        } else if (_.startsWith(id, 'hero')) {
            if (p1.hero.id === id) {
                return p1.hero;
            } else {
                return p2.hero;
            }
        }
    }
};
