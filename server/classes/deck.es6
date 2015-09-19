
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

    getClientData() {
        return {
            count: this.getCount()
        };
    }

    getRandomCards(count, type, race) {
        var deckCards = this.deckCards;

        if (type) {
            deckCards = deckCards.filter(deckCard => deckCard.card.type === type);
        }

        if (race) {
            deckCards = deckCards.filter(deckCards => deckCards.card.minion && deckCards.card.minion.race === race);
        }

        const cardCount = deckCards.length;

        if (cardCount === 0) {
            return [];
        } else if (cardCount <= count) {
            return _.shuffle(deckCards.map(deckCard => deckCard.card));
        } else {
            const cards = [];

            while (cards.length < count) {
                const card = H.getRandomElement(this.deckCards).card;

                if (!_.contains(cards, card)) {
                    cards.push(card);
                }
            }

            return cards;
        }
    }

    removeCards(cards) {
        this.deckCards = this.deckCards.filter(deckCard => !_.contains(cards, deckCard));
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
            const insertIndex = _.random(allowCards.length - offset);

            allowCards.splice(insertIndex, 0, card);
        });

        this.deckCards = allowCards;
    }
};
