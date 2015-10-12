
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

const H = require('../namespace');

const INACTIVE_MESSAGES = [
    'replace-cards',
    'concede',
    'chat-message'
];

H.Player = class Player extends EventEmitter {
    constructor(ws) {
        super();

        this.id = _.uniqueId('player');

        this.battle = null;
        this.ws = ws;
        this.status = 'waiting';
        this.userName = '';

        this.flags = {};

        this.active = false;
        this.deck = null;
        this.hero = null;
        this.clas = null;
        this.energy = new H.Energy();
        this.hand = new H.Hand(this);
        this.creatures = new H.Creatures(this);
        this.traps = new H.Traps(this);

        // Тут нужен синхронный промис
        this.battleEnterPromise = new Promise(resolve => {
            this._battleEnterFillPromise = resolve;
        });

        this._thisTurnPlayedCards = [];
        this._outOfCardCount = 0;

        ws
            .on('message', json => {
                const packet = JSON.parse(json);
                this.onMessage(packet.msg, packet.data);
            })
            .on('close', () => {
                this.flags['disconnected'] = true;

                this.emit('disconnect');
            });
    }

    getEnemy() {
        return this.battle.getOpponent(this);
    }

    onMessage(msg, data) {

        if (this.flags['logged']) {

            if (_.contains(INACTIVE_MESSAGES, msg) || this.active) {
                this.log('Client Message:', msg);

                switch (msg) {
                    case 'replace-cards':
                        this.deck.replaceCards(data, this.startingCardCount);

                        this.flags['deck'] = true;

                        this.emit('message', { msg: 'cards-replaced' });

                        break;
                    case 'end-turn':
                        this.endTurn();
                        break;
                    case 'concede':
                        this.hero.kill();
                        break;
                    case 'get-targets':
                    case 'play-card':
                    case 'hit':
                    case 'use-hero-skill':
                    case 'chat-emotion':
                    case 'chat-message':
                        this.emit('client-message', { msg, data });
                        break;
                    default:
                        if (this._listeners && this._listeners[msg] && this._listeners[msg].length) {
                            this._listeners[msg].forEach(callback => {
                                callback(data);
                            });
                        } else {
                            this.warn('Unregistered Client Message:', msg);
                        }
                }
            } else {
                this.warn('Inactive Client Message:', msg);
            }
        } else if (msg === 'join') {
            this.userName = data.name;
            this.flags['logged'] = true;

            this.joinParams = data;

            var deck = this.joinParams.deck;

            if (typeof deck !== 'object') {
                deck = H.BASIC_DECKS[deck];
            }

            this.clas = deck.clas;
            this.deck = new H.Deck(deck.cardIds);
            this.hero = H.Hero.create(H.CLASSES_L[deck.clas], this);

            const brackedName = '[' + this.userName + ']';
            this.log = console.log.bind(console, brackedName);
            this.warn = console.warn.bind(console, brackedName);

            this.emit('logged');
        }
    }

    addMessageListener(msg, callback) {
        if (!this._listeners) {
            this._listeners = {};
        }

        this._listeners[msg] = this._listeners[msg] || [];

        this._listeners[msg].push(callback);
    }

    addOnceMessageListener(msg, callback) {
        const that = this;

        const func = function() {
            that.removeMessageListener(msg, func);

            callback.apply(this, arguments);
        };

        this.addMessageListener(msg, func);
    }

    removeMessageListener(msg, callback) {
        if (this._listeners && this._listeners[msg]) {
            this._listeners[msg] = this._listeners[msg].filter(func => func !== callback);
        }
    }

    enterBattle(battle) {
        this.battle = battle;

        this.enemy = battle.getOpponent(this);

        this.battle.on('end-turn', this._onTurnEnd.bind(this));
        this.battle.on('start-turn', this._onTurnStart.bind(this));
        this.battle.on('play-card', this._onPlayCard.bind(this));

        this.emit('battle-enter', battle);

        this._battleEnterFillPromise(battle);
    }

    sendMessage(msg, json) {
        this.log('Sending:', msg);

        try {
            this.ws.send(JSON.stringify({
                msg: msg,
                data: json
            }));
        } catch (e) {
            console.warn('Socket sending message error:', e);
            console.warn(json);
        }
    }

    activate() {
        this.active = true;

        this._thisTurnPlayedCards.length = 0;
    }

    getPlayedCards() {
        return this._thisTurnPlayedCards;
    }

    getPlayedCardCount() {
        return this._thisTurnPlayedCards.length;
    }

    deactivate() {
        this.active = false;
    }

    drawCard() {
        const card = this.deck.popCard();

        if (card) {
            if (this.hand.canAddCard()) {
                const handCard = this.hand.addCard(card);

                this.battle.emit('draw-card', {
                    player: this,
                    handCard
                });

                return handCard;

            } else {
                this.emit('message', {
                    msg: 'burn-card',
                    data: card
                });
            }

        } else {
            this._outOfCardCount++;

            this.battle.addBattleAction({
                name: 'fatigue',
                player: this.id,
                damage: this._outOfCardCount
            });

            this.hero.dealDamage(this._outOfCardCount);
        }
    }

    endTurn() {
        this.emit('message', {
            msg: 'end-turn'
        });
    }

    getGameData() {
        const data = {
            active: this.active,
            name: this.userName,
            hero: this.hero.getClientData(),
            energy: this.energy.getClientData(),
            hand: this.hand.getClientData(),
            deck: this.deck.getClientData(),
            traps: this.traps.getClientData(),
            creatures: this.creatures.getClientData()
        };

        // FIXME for weapon
        data.greenEnd = (
            data.active &&
            !data.hero.heroSkill.canUseSkill &&
            (data.hero.attack === 0 || data.hero.flags['tired']) &&
            !data.hand.some(handCard => handCard.flags['can-play']) &&
            !data.creatures.some(minion => !minion.flags['tired']));

        return data;
    }

    _onTurnStart(player) {
        if (this === player) {
            this.activate();

            this.drawCard();

            this.creatures.onStartTurn();
        }
    }

    _onTurnEnd(player) {
        if (this === player) {
            this.deactivate();

            this.creatures.resetFlag('freeze');

            this.creatures.onEndTurn();
            this.hero.wakeUp();
        }
    }

    _onPlayCard(o) {
        if (o.player === this) {
            this._thisTurnPlayedCards.push(o.card);
        }
    }

    closeSocket() {
        this.ws.close();
    }

};
