
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
        this.addCard(H.CARDS.findByName('The Coin'));
    }

    _findHandCard(id) {
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

    getHandCard(id) {
        const info = this._findHandCard(id);

        return info && info.card;
    }

    removeHandCard(id) {
        const info = this._findHandCard(id);

        if (info) {
            this.cards.splice(info.index, 1);
        }
    }
};
