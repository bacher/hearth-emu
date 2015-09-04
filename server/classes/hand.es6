
const _ = require('lodash');
const H = require('../namespace');

const MAX_HAND_CARD_COUNT = 10;


H.Hand = class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(new H.HandCard(card));
    }

    canAddCard() {
        return this.cards.length !== MAX_HAND_CARD_COUNT;
    }

    getGameData() {
        return this.cards;
    }

    addCoinCard() {
        this.addCard(H.CARDS.getByName('The Coin'));
    }

    getCardById(id) {
        return _.find(this.cards, { id });
    }

    removeHandCard(card) {
        this.cards.splice(this.cards.indexOf(card), 1);
    }
};
