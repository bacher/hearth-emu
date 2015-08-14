
const H = require('./common');
const Card = require('./classes/card');
const ACTIVATIONS = require('./classes/activations');

const cards = [
    new Card({
        id: 'the_coin',
        name: 'The Coin',
        type: H.CARD_TYPES.spell,
        cost: 0,
        clas: H.CLASSES.neutral,
        addToDeck: false,
        act: ACTIVATIONS.addMana,
        param: 1
    }),

    new Card({
        id: 'chillwind_yeti',
        name: 'Chillwind Yeti',
        cost: 4,
        act: ACTIVATIONS.summon,
        param: 'chillwind_yeti',
        type: H.CARD_TYPES.minion,
        clas: H.CLASSES.neutral
    })
];

const cardsHash = {};

for (var i = 0; i < cards.length; ++i) {
    var card = cards[i];
    cardsHash[card.id] = card;
}

module.exports = cardsHash;
