
const _ = require('lodash');
const Card = require('./card');

module.exports = class Deck {
    constructor() {
        this.cards = [
            new Card({}),
            new Card({}),
            new Card({}),
            new Card({})
        ];
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
