
const _ = require('lodash');
const CARDS = require('../cards');

const MAX_HAND_CARD_COUNT = 10;

module.exports = class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push({
            base: card,
            id: _.uniqueId('hand_')
        });
    }

    canAddCard() {
        return this.cards.length !== MAX_HAND_CARD_COUNT;
    }

    getGameData() {
        return this.cards;
    }

    addCoinCard() {
        this.addCard(CARDS.findByName('The Coin'));
    }

    findCard(id) {
        for (var i = 0; i < this.cards.length; ++i) {
            if (this.cards[i].id === id) {
                return {
                    index: i,
                    card: this.cards[i]
                };
            }
        }

        return null;
    }

    getCard(id) {
        const info = this.findCard(id);

        return info && info.card;
    }

    removeCard(id) {
        const info = this.findCard(id);

        if (info) {
            this.cards.splice(info.index, 1);
        }
    }
};
