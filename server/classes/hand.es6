
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
        return this.cards;
    }

    findCard(cid) {
        for (var i = 0; i < this.cards.length; ++i) {
            if (this.cards[i].cid === cid) {
                return {
                    index: i,
                    card: this.cards[i]
                };
            }
        }

        return null;
    }

    getCard(cid) {
        var info = this.findCard(cid);

        return info && info.card;
    }

    removeCard(cid) {
        var info = this.findCard(cid);

        if (info) {
            this.cards.splice(info.index, 1);
        }
    }
};
