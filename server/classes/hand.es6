
const MAX_HAND_CARD_COUNT = 10;

module.exports = class Hand {
    constructor() {
        this.cards = [];
    }

    addCard(card) {
        this.cards.push(card);
    }

    canAddCard() {
        return this.cards.length !== MAX_HAND_CARD_COUNT;
    }

    getGameData() {
        return {
            cards: this.cards
        };
    }
};
