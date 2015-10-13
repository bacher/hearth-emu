
const H = require('./namespace');

const C = {
    'tracking': function(o) {
        const cards = [
            o.player.deck.popCard(),
            o.player.deck.popCard(),
            o.player.deck.popCard()
        ];

        o.player.initCardSelectMode(cards, card => {
            o.player.hand.addCard(card);
        });
    },
    'totemic-slam'(o) {
        const cards = [
            H.CARDS.getByName('Searing Totem'),
            H.CARDS.getByName('Stoneclaw Totem'),
            H.CARDS.getByName('Wrath of Air Totem'),
            H.CARDS.getByName('Healing Totem')
        ];

        o.player.initCardSelectMode(cards, card => {
            o.player.creatures.addCreature(new H.Minion(null, card));
        });
    }
};

H.CustomActions = {
    getByName(name) {
        return C[name];
    }
};
