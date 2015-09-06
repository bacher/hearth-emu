
const _ = require('lodash');
const H = require('../namespace');

const MAX_HAND_CARD_COUNT = 10;


H.Hand = class Hand {
    constructor(player) {
        this.player = player;

        this.cards = [];
    }

    addCard(card) {
        if (this.cards.length <= 10) {
            this.cards.push(new H.HandCard(this.player, card));
        }
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

    getRandomHandCard() {
        return this.cards[Math.floor(Math.random() * this.cards.length)];
    }

    removeHandCard(card) {
        this.cards.splice(this.cards.indexOf(card), 1);
    }
};
