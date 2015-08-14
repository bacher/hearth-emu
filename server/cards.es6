
const H = require('./common');
const Card = require('./classes/card');
const ACTIVATIONS = require('./classes/activations');

const cards = [
    new Card({
        name: 'The Coin',
        type: H.CARD_TYPES.spell,
        cost: 0,
        clas: H.CLASSES.neutral,
        uncollectable: true,
        act: ACTIVATIONS.addMana,
        param: 1,
        pic: '148/735/141.png'
    }),

    new Card({
        name: 'Chillwind Yeti',
        cost: 4,
        act: ACTIVATIONS.summon,
        param: 'chillwind_yeti',
        type: H.CARD_TYPES.minion,
        clas: H.CLASSES.neutral,
        pic: '147/652/31.png'
    }),

    new Card({
        name: 'Lightning Bolt',
        cost: 1,
        act: [
            ACTIVATIONS.dealDamage,
            ACTIVATIONS.overload
        ],
        param: [3, 1],
        type: H.CARD_TYPES.spell,
        clas: H.CLASSES.shaman,
        pic: '148/115/10.png'
    }),

    new Card({
        name: 'Earth Shock',
        cost: 1,
        act: [ACTIVATIONS.silence, ACTIVATIONS.dealDamage],
        param: [null, 1],
        type:  H.CARD_TYPES.spell,
        clas: H.CLASSES.shaman,
        pic: '148/127/77.png'
    }),

    new Card({
        name: 'Rockbiter Weapon',
        cost: 1,
        act: ACTIVATIONS.gainAttackThisTurn,
        param: 3,
        type:  H.CARD_TYPES.weapon,
        clas: H.CLASSES.shaman,
        pic: '147/456/491.png'
    }),

    new Card({
        name: 'Feral Spirit',
        cost: 3,
        act: ACTIVATIONS.spawnCreatures,
        param: 'feral_spirit',
        type:  H.CARD_TYPES.spell,
        clas: H.CLASSES.shaman,
        pic: '148/136/214.png'
    }),

    new Card({
        name: 'Innervate',
        cost: 0,
        act: ACTIVATIONS.gainCrystalsThisTurn,
        param: 2,
        type: H.CARD_TYPES.spell,
        clas: H.CLASSES.druid,
        pic: '148/97/548.png'
    }),

    /*
    new Card({
        name: '',
        cost: 3,
        act: ACTIVATIONS.summon,
        param: 0,
        type:  H.CARD_TYPES.minion,
        clas: H.CLASSES.neutral,
        pic: ''
    }),

    */
];

for (var i = 0; i < cards.length; ++i) {
    cards[i].id = i;
}

module.exports = cards;
