
const _ = require('lodash');
const CARDS = require('../cards');

module.exports = class Deck {
    constructor() {
        this.cards = [];

        for (var i = 0; i < 10; ++i) {
            this.cards.push({
                info: CARDS['chillwind_yeti'],
                cid: _.uniqueId('c')
            });
        }
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
