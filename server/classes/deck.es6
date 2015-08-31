
const _ = require('lodash');
const H = require('../namespace');

H.Deck = class Deck {
    constructor(cardIds) {
        this.cards = cardIds.map(id => H.CARDS.hash[id]);
    }

    shuffle() {
        this.cards = _.shuffle(this.cards);
    }

    getNextCard() {
        return this.cards.pop();
    }

    getCount() {
        return this.cards.length;
    }

    getGameData() {
        return {
            count: this.getCount()
        };
    }
};
