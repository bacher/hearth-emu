
const _ = require('lodash');
const CARDS = require('../cards');

module.exports = class Deck {
    constructor() {
        this.cards = [];
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
