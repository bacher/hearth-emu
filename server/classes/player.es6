const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

const Deck = require('./deck');
const Hero = require('./hero');
const Hand = require('./hand');
const Minions = require('./minions');
const CARDS = require('../cards');

module.exports = class Player extends EventEmitter {
    constructor(ws) {
        super();

        this.ws = ws;
        this.status = 'waiting';

        this.active = false;
        this.deck = new Deck();
        this.hero = new Hero();
        this.hand = new Hand();
        this.minions = new Minions();

        ws
            .on('message', json => {
                this.onMessage(JSON.parse(json));
            })
            .on('close', () => {
                this.status = 'off';
            });
    }

    onMessage(json) {
        console.log('Client Message:', json.msg);

        switch (json.msg) {
            case 'play-card':
                this.playCard(json.data);
                break;
            case 'end-turn':
                this.endTurn();
                break;

        }
    }

    sendMessage(msg, json) {
        console.log('Sending', msg);

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

        console.log(card);

        this.emit('message', {
            msg: 'playCard',
            data: card
        });

        this.hand.removeCard(params.cid);
        this.hero.removeMana(card.cost);

        this.emit('message', {
            msg: 'updateClients'
        });
    }

    endTurn() {
        this.emit('message', {
            msg: 'endTurn'
        });
    }

    getGameData() {
        return {
            active: this.active,
            hero: this.hero.getGameData(),
            hand: this.hand.getGameData(),
            deck: this.deck.getGameData(),
            minions: this.minions.getGameData()
        };
    }
};
