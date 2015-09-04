
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
        this.hand = new H.Hand();
        this.creatures = new H.Creatures();

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

                        this.emit('message', {
                            msg: 'cards-replaced'
                        });

                        break;
                    case 'play-card':
                        this.playCard(data);
                        break;
                    case 'end-turn':
                        this.endTurn();
                        break;
                    case 'hit':
                    case 'use-hero-skill':
                    case 'get-targets':
                        this.emit('message', { msg, data });
                        break;
                    default:
                        this.warn('Unregistered Client Message:', msg);

                }
            } else {
                this.warn('Inactive Client Message:', msg);
            }
        } else if (msg === 'join') {
            this.userName = data.name;
            this.flags['logged'] = true;

            this.joinParams = data;

            const deck = this.joinParams.deck;

            this.deck = new H.Deck(deck.cardIds);
            this.hero = H.Hero.create(this, deck.clas);

            const brackedName = '[' + this.userName + ']';
            this.log = console.log.bind(console, brackedName);
            this.warn = console.warn.bind(console, brackedName);

            this.emit('logged');
        }
    }

    enterBattle(battle) {
        this.battle = battle;

        this.enemy = battle.getOpponent(this);

        this.battle.on('turn-end', this._onTurnEnd.bind(this));
        this.battle.on('turn-start', this._onTurnStart.bind(this));
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
    }

    deactivate() {
        this.active = false;
    }

    drawCard() {
        const card = this.deck.getNextCard();

        if (card) {
            if (this.hand.canAddCard()) {
                this.hand.addCard(card);
            } else {
                // Burn card
                console.log('IMPL!');
            }

        } else {
            // Make damage
            console.log('IMPL!');
        }
    }

    playCard(params) {
        const handCard = this.hand.getHandCard(params.id);

        this.emit('message', {
            msg: 'play-card',
            data: {
                handCard,
                params
            }
        });

        this.hand.removeHandCard(params.id);
        this.hero.removeMana(handCard.base.cost);

        this.emit('message', {
            msg: 'update-clients'
        });
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
            hand: this.hand.getGameData(),
            deck: this.deck.getGameData(),
            creatures: this.creatures.getGameData()
        };
    }

    _onTurnStart(player) {
        if (this === player) {
            this.activate();
            this.creatures.wakeUpAll();
            this.hero.addCrystal();
            this.hero.restoreMana();
            this.hero.skillUsed = false;
            this.drawCard();
        }
    }

    _onTurnEnd(player) {
        if (this === player) {
            this.deactivate();

            this.creatures.resetFlag('freeze');
        }
    }

};
