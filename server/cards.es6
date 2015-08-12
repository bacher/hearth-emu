
const H = require('./common');
const Card = require('./classes/card');
const ACTIVATIONS = require('./classes/activations');

const cards = {
    'the_coin': new Card({
        name: 'The Coin',
        type: H.CARD_TYPES.spell,
        cost: 0,
        clas: H.CLASSES.neutral,
        act: ACTIVATIONS.addMana,
        param: 1
    }),

    'chillwind_yeti': new Card({
        name: 'Chillwind Yeti',
        cost: 4,
        act: ACTIVATIONS.summon,
        param: 'chillwind_yeti',
        type: H.CARD_TYPES.minion,
        clas: H.CLASSES.neutral
    })
};

for (var id in cards) {
    cards[id].id = id;
}

module.exports = cards;
