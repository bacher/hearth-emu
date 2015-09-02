
const H = require('./namespace');


const cardsRaw = require('./cards/minions.json');

const cards = cardsRaw.map(card => new H.Card(card));

const cardsHash = {};

for (var i = 0; i < cards.length; ++i) {
    var card = cards[i];
    cardsHash[card.id] = card;
}

H.CARDS = {
    list: cards,
    hash: cardsHash,
    getByName: name => {
        for (var i = 0; i < cards.length; ++i) {
            if (cards[i].name === name) {
                return cards[i];
            }
        }
    }
};
