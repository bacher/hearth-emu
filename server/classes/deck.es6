
const _ = require('lodash');
const CARDS = require('../cards').hash;

module.exports = class Deck {
    constructor(cardIds) {
        this.cards = cardIds.map(id => CARDS[id]);
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
