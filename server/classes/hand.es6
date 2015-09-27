
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
            const handCard = new H.HandCard(this.player, card);

            this.cards.push(handCard);

            return handCard;
        }
    }

    canAddCard() {
        return this.cards.length !== MAX_HAND_CARD_COUNT;
    }

    getCount() {
        return this.cards.length;
    }

    getClientData() {
        return this.cards.map(handCard => {
            return handCard.getClientData();
        });
    }

    addCoinCard() {
        this.addCard(H.CARDS.getByName('The Coin'));
    }

    getCardById(id) {
        return _.find(this.cards, { id });
    }

    getRandomHandCard() {
        return H.getRandomElement(this.cards);
    }

    removeHandCard(card) {
        this.cards.splice(this.cards.indexOf(card), 1);
    }

    removeRandomHandCard() {
        this.removeHandCard(this.getRandomHandCard());
    }

    empty() {
        this.cards.length = 0;
    }
};
