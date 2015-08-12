const EventEmitter = require('events').EventEmitter;

const Deck = require('./deck');
const Hero = require('./hero');
const Hand = require('./hand');
const Minions = require('./minions');

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
                console.log(json);
                this.onMessage(json);
            })
            .once('close', () => {
                this.status = 'off';
                console.log('соединение закрыто')
            });
    }

    onMessage(json) {
        console.log(json.action);

        switch (json.action) {
            case 'activate-card':
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

    addManaCard() {
        this.hand.addCard();
    }

    endTurn() {
        this.emit('message', {
            event: 'end-turn'
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
