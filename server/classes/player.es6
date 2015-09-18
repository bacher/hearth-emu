
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

const H = require('../namespace');

const INACTIVE_MESSAGES = [
    'replace-cards'
];

H.Player = class Player extends EventEmitter {
    constructor(ws) {
        super();

        this.battle = null;
        this.ws = ws;
        this.status = 'waiting';
        this.userName = '';

        this.flags = {};

        this.active = false;
        this.deck = null;
        this.hero = null;
        this.hand = new H.Hand(this);
        this.creatures = new H.Creatures(this);
        this.traps = new H.Traps(this);

        this._playedCardCount = 0;
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
                    case 'get-targets':
                    case 'play-card':
                    case 'hit':
                    case 'use-hero-skill':
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

            this.deck = new H.Deck(deck.cardIds);
            this.hero = H.Hero.create(this, deck.clas);

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
    }

    sendMessage(msg, json) {
        this.log('Sending:', msg);

        try {
            this.ws.send(JSON.stringify({
                msg: msg,
                data: json
            }));
        } catch (e) {
            console.log('ERROR', e);
            console.log(json);
        }
    }

    activate() {
        this.active = true;

        this._playedCardCount = 0;
    }

    getPlayedCardCount() {
        return this._playedCardCount;
    }

    deactivate() {
        this.active = false;
    }

    drawCard() {
        const card = this.deck.popCard();

        if (card) {
            if (this.hand.canAddCard()) {
                return this.hand.addCard(card);
            } else {
                this.emit('message', {
                    msg: 'burn-card',
                    data: card
                });
            }

        } else {
            this._outOfCardCount++;

            this.emit('message', {
                msg: 'fatigue',
                data: {
                    damage: this._outOfCardCount
                }
            });
        }
    }

    endTurn() {
        this.emit('message', {
            msg: 'end-turn'
        });
    }

    getGameData() {
        return {
            active: this.active,
            name: this.userName,
            hero: this.hero.getClientData(),
            hand: this.hand.getClientData(),
            deck: this.deck.getClientData(),
            traps: this.traps.getClientData(),
            creatures: this.creatures.getClientData()
        };
    }

    _onTurnStart(player) {
        if (this === player) {
            this.activate();

            this.drawCard();

            this.creatures.wakeUpAll();
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
            this._playedCardCount++;
        }
    }

    closeSocket() {
        this.ws.close();
    }

};
