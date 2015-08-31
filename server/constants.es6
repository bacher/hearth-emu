
const H = require('./namespace');


H.CLASSES = {
    neutral: 0,
    warrior: 1,
    shaman: 2,
    rogue: 3,
    paladin: 4,
    hunter: 5,
    druid: 6,
    warlock: 7,
    mage: 8,
    priest: 9
};

H.CLASSES_L = [
    'neutral',
    'warrior',
    'shaman',
    'rogue',
    'paladin',
    'hunter',
    'druid',
    'warlock',
    'mage',
    'priest'
];

H.CLASSES_M = {
    n: 0,
    w: 1,
    s: 2,
    r: 3,
    pl: 4,
    h: 5,
    d: 6,
    wl: 7,
    m: 8,
    p: 9
};

H.CLASSES_ML = [
    'n',
    'w',
    's',
    'r',
    'pl',
    'h',
    'd',
    'wl',
    'm',
    'p'
];

H.CARD_TYPES = {
    minion: 1,
    spell: 2,
    weapon: 3,
    trap: 4
};

H.CARD_TYPES_L = [
    null,
    'minion',
    'spell',
    'weapon',
    'trap'
];
