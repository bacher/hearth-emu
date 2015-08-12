
module.exports = {
    cards: {
        'coin': new Card({
            type: CARD_TYPES.spell,
            cost: 0,
            activation: ACTIVATIONS.addMana,
            param: 1
        })
    },
    getCard: name => {
        return this.cards[name];
    }
};
