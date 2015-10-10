
const H = require('./namespace');

const cardsRaw = require('../data/cards.json');
const cardsUsesHash = require('../data/uses.json');

const cards = cardsRaw.map(card => new H.Card(card));

const cardsHash = {};
const cardsCostHash = {};
const cardsTypeHash = {
    [H.CARD_TYPES.minion]: [],
    [H.CARD_TYPES.spell]: [],
    [H.CARD_TYPES.weapon]: [],
    [H.CARD_TYPES.trap]: []
};
const legendary = [];

for (var i = 0; i < cards.length; ++i) {
    var card = cards[i];
    cardsHash[card.id] = card;

    if (card.flags['unimplemented']) {
        cardsTypeHash[card.type].push(card);

        if (!cardsCostHash[card.cost]) {
            cardsCostHash[card.cost] = [];
        }

        cardsCostHash[card.cost].push(card);

        if (card.flags['unique']) {
            legendary.push(card);
        }
    }
}

H.CARDS = {
    list: cards,
    hash: cardsHash,
    clientList: cards.map(card => {
        const info = card.getInfo(false, true);
        info.usesPercent = cardsUsesHash[info.name] || '';

        return info;
    }),
    getById: function(id) {
        return this.hash[id];
    },
    getByName: function(name, type, onlyCollectable) {
        const lowerCaseName = name.toLowerCase();

        for (var i = 0; i < cards.length; ++i) {
            const card = cards[i];

            if (type && card.type !== type) {
                continue;
            }

            if (onlyCollectable && card.flags['uncollectable']) {
                continue;
            }

            if (card.name.toLowerCase() === lowerCaseName) {
                return card;
            }
        }
    },
    getRandom(type = null, cost = null, race = null, clas = null) {
        var cards;

        if (cost) {
            cards = cardsCostHash[cost];

            if (type) {
                cards = cards.filter(card => card.type === type);

                if (race && type === H.CARD_TYPES.minion) {
                    cards = cards.filter(card => card.minion.race === race);
                }

                if (clas) {
                    cards = cards.filter(card => card.clas === race);
                }
            }

        } else {
            if (type) {
                cards = cardsTypeHash[type];

                if (race && type === H.CARD_TYPES.minion) {
                    cards = cards.filter(card => card.minion.race === race);
                }

                if (clas) {
                    cards = cards.filter(card => card.clas === race);
                }
            }
        }

        return H.getRandomElement(cards);
    },
    getRandomLegendary(type = null) {
        var cards = legendary;

        if (type) {
            cards = cards.filter(card => card.type === type);
        }

        return H.getRandomElement(cards);
    }
};
