
const H = require('./common');
const Card = require('./classes/card');

var cards = [];

['./cards/minions.json', './cards/weapons.json', './cards/spells.json'].forEach(packName => {
    const cardsRaw = require(packName);

    cards = cards.concat(cardsRaw.map(card => new Card(card)));
});

const cardsHash = {};

for (var i = 0; i < cards.length; ++i) {
    var card = cards[i];
    cardsHash[card.id] = card;
}

module.exports = {
    list: cards,
    hash: cardsHash,
    findByName: name => {
        for (var i = 0; i < cards.length; ++i) {
            if (cards[i].name === name) {
                return cards[i];
            }
        }
    }
};
