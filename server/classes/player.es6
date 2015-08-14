const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

const Deck = require('./deck');
const Hero = require('./hero');
const Hand = require('./hand');
const Creatures = require('./creatures');
const CARDS = require('../cards');

module.exports = class Player extends EventEmitter {
    constructor(ws) {
        super();

        this.ws = ws;
        this.status = 'waiting';
        this.userName = '';

        this.flags = {
            joined: false
        };

        this.active = false;
        this.deck = new Deck();
        this.hero = new Hero();
        this.hand = new Hand();
        this.creatures = new Creatures();

        ws
            .on('message', json => {
                this.onMessage(JSON.parse(json));
            })
            .on('close', () => {
                this.status = 'off';
            });
    }

    onMessage(json) {

        if (this.flags.joined) {

            if (this.active) {
                this.log('Client Message:', json.msg);

                switch (json.msg) {
                    case 'play-card':
                        this.playCard(json.data);
                        break;
                    case 'end-turn':
                        this.endTurn();
                        break;
                    case 'hit-creature':
                    case 'hit-hero':
                        this.emit('message', json);
                        break;
                    default:
                        this.warn('Unregistered Client Message:', json.msg);

                }
            } else {
                this.warn('Inactive Client Message:', json.msg)
            }
        } else {
            this.userName = json.data.name;
            this.flags.joined = true;

            const brackedName = '[' + this.userName + ']';
            this.log = console.log.bind(console, brackedName);
            this.warn = console.warn.bind(console, brackedName);
        }
    }

    sendMessage(msg, json) {
        this.log('Sending:', msg);

        this.ws.send(JSON.stringify({
            msg: msg,
            data: json
        }));
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
            }

        } else {
            // Make damage
        }
    }

    addCoinCard() {
        this.hand.addCard({
            cid: _.uniqueId('c'),
            info: CARDS['the_coin']
        });
    }

    playCard(params) {

        const card = this.hand.getCard(params.cid);

        this.emit('message', {
            msg: 'play-card',
            data: card
        });

        this.hand.removeCard(params.cid);
        this.hero.removeMana(card.info.cost);

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
            hero: this.hero.getGameData(),
            hand: this.hand.getGameData(),
            deck: this.deck.getGameData(),
            creatures: this.creatures.getGameData()
        };
    }
};
