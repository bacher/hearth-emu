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
        this.deck = null;
        this.hero = null;
        this.hand = new Hand();
        this.creatures = new Creatures();

        ws
            .on('message', json => {
                const packet = JSON.parse(json);
                this.onMessage(packet.msg, packet.data);
            })
            .on('close', () => {
                this.status = 'off';
            });
    }

    onMessage(msg, data) {

        if (this.flags.joined) {

            if (this.active) {
                this.log('Client Message:', msg);

                switch (msg) {
                    case 'play-card':
                        this.playCard(data);
                        break;
                    case 'end-turn':
                        this.endTurn();
                        break;
                    case 'hit-creature':
                    case 'hit-hero':
                    case 'use-hero-skill':
                        this.emit('message', { msg, data });
                        break;
                    default:
                        this.warn('Unregistered Client Message:', msg);

                }
            } else {
                this.warn('Inactive Client Message:', msg)
            }
        } else if (msg === 'join') {
            this.userName = data.name;
            this.flags.joined = true;

            this.deck = new Deck(data.deck.cards);
            this.hero = new Hero(data.deck.clas);

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

    playCard(params) {

        const card = this.hand.getCard(params.id);

        this.emit('message', {
            msg: 'play-card',
            data: card
        });

        this.hand.removeCard(params.id);
        this.hero.removeMana(card.base.cost);

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
