
const _ = require('lodash');
const H = require('../namespace');

H.Deck = class Deck {
    constructor(cardIds) {
        this.deckCards = _.shuffle(cardIds.map(id => {
            return {
                card: H.CARDS.hash[id],
                id: _.uniqueId('deck')
            };
        }));
    }

    showLastCards(count) {
        return this.deckCards.slice(-count).reverse();
    }

    getNextCard() {
        if (this.deckCards.length) {
            return this.deckCards.pop().card;
        }
    }

    getCount() {
        return this.deckCards.length;
    }

    getGameData() {
        return {
            count: this.getCount()
        };
    }

    replaceCards(cardIds, drawCount) {
        const banCards = [];
        const allowCards = this.deckCards.filter(card => {
            if (cardIds.indexOf(card.id) !== -1) {
                banCards.push(card);
            } else {
                return true;
            }
        });

        const offset = drawCount - cardIds.length;

        banCards.forEach(card => {
            const insertIndex = Math.floor(Math.random() * (allowCards.length - offset + 1));

            allowCards.splice(insertIndex, 0, card);
        });

        this.deckCards = allowCards;
    }
};
