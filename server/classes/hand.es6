
const _ = require('lodash');
const H = require('../namespace');

const MAX_HAND_CARD_COUNT = 10;


H.Hand = class Hand {
    constructor(player) {
        this.player = player;

        this.cards = [];
    }

    addCard(card) {
        if (this.cards.length < MAX_HAND_CARD_COUNT) {
            const handCard = new H.HandCard(this.player, card);

            this.cards.push(handCard);

            return handCard;
        }
    }

    canAddCard() {
        return this.cards.length !== MAX_HAND_CARD_COUNT;
    }

    getAll() {
        return this.cards;
    }

    getAllByRace(race) {
        return this.cards.filter(card => card.base.type === H.CARD_TYPES.minion && card.base.minion.race === race);
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

    getRandomHandCard(byType) {
        var cards = this.cards;

        if (byType) {
            cards = cards.filter(handCard => handCard.base.type === byType);
        }

        return H.getRandomElement(cards);
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

    isEmpty() {
        return this.cards.length === 0;
    }
};
