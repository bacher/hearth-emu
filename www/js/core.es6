
const H = {

    CLASSES: {
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
    },

    CLASSES_L: [
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
    ],

    CARD_TYPES: {
        minion: 1,
        spell: 2,
        weapon: 3,
        trap: 4
    },

    CARD_TYPES_L: [
        null,
        'minion',
        'spell',
        'weapon',
        'trap'
    ],

    HERO_NAMES: [
        '',
        'Garrosh Hellscream',
        'Thrall',
        'Valeera Sanguinar',
        'Uther Lightbringer',
        'Rexxar',
        'Malfurion Stormrage',
        'Gul\'dan',
        'Jaina Proudmoore',
        'Anduin Wrynn'
    ]
};

H.Mixins = {};

H.Screens = {};

H.checkParam = function(string) {
    return new RegExp('[?&]' + string + '(?:&|$)').test(window.location.search);
};

H.makeCardUrl = function(part) {
    return 'http://media-hearth.cursecdn.com/avatars/' + part + '.png';
};

H.loadDecks = function() {
    if (!H.decks) {
        H.decks = JSON.parse(localStorage.getItem('decks')) || [];

        const deckId = Number(localStorage.getItem('activeDeckId'));
        const deck = H.getDeckById(deckId);

        if (deck) {
            H.activeDeck = deck;
        }
    }
};

H.saveDecks = function() {
    window.localStorage.setItem('decks', JSON.stringify(H.decks));
    window.localStorage.setItem('activeDeckId', H.activeDeck && H.activeDeck.id || null);
};

H.getDeckById = function(id) {
    return _.find(H.decks, deck => deck.id === id);
};

function render($cont, tmplName, params) {
    try {
        jade.render($cont[0], tmplName, params || {});
    } catch(e) {
        /* jshint debug:true */
        debugger;
        throw e;
    }
}

if (H.checkParam('cursor')) {
    const $cursor = $('<div>').addClass('cursor').appendTo('BODY');

    $('BODY')
        .css('cursor', 'none')
        .on('mousemove', e => {
            $cursor.css({
                top: e.pageY - 4,
                left: e.pageX - 15
            });
        })
        .on('mousedown', () => {
            $cursor.addClass('down');
        })
        .on('mouseup', () => {
            $cursor.removeClass('down');
        });
}
