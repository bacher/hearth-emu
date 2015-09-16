
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

    popCard() {
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

    getRandomCards(count) {
        const deckCards = this.deckCards;
        const cardCount = deckCards.length;

        if (cardCount === 0) {
            return [];
        } else if (cardCount <= count) {
            return _.shuffle(deckCards.map(deckCard => deckCard.card));
        } else {
            const cards = [];

            while (cards.length < count) {
                const card = this.deckCards[Math.floor(Math.random() * this.deckCards.length)].card;

                if (!_.contains(cards, card)) {
                    cards.push(card);
                }
            }

            return cards;
        }
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
