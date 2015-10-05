
const H = require('./namespace');


const cardsRaw = require('./data/cards.json');

const cards = cardsRaw.map(card => new H.Card(card));

const cardsHash = {};
const cardsCostHash = {};
const cardsTypeHash = {
    [H.CARD_TYPES.minion]: [],
    [H.CARD_TYPES.spell]: [],
    [H.CARD_TYPES.weapon]: [],
    [H.CARD_TYPES.trap]: []
};

for (var i = 0; i < cards.length; ++i) {
    var card = cards[i];
    cardsHash[card.id] = card;

    cardsTypeHash[card.type].push(card);

    if (!cardsCostHash[card.cost]) {
        cardsCostHash[card.cost] = [];
    }

    cardsCostHash[card.cost].push(card);
}

H.CARDS = {
    list: cards,
    hash: cardsHash,
    clientList: cards.map(card => card.getInfo(false, true)),
    getById: function(id) {
        return this.hash[id];
    },
    getByName: function(name, type) {
        const lowerCaseName = name.toLowerCase();

        for (var i = 0; i < cards.length; ++i) {
            const card = cards[i];

            if (type && card.type !== type) {
                continue;
            }

            if (card.name.toLowerCase() === lowerCaseName) {
                return card;
            }
        }
    },
    getRandom(type = null, cost = null, race = null) {
        var cards;

        if (cost) {
            cards = cardsCostHash[cost];

            if (type) {
                cards = cards.filter(card => card.type === type);

                if (race && type === H.CARD_TYPES.minion) {
                    cards = cards.filter(card => card.minion.race === race);
                }
            }

        } else {
            if (type) {
                cards = cardsTypeHash[type];

                if (race && type === H.CARD_TYPES.minion) {
                    cards = cards.filter(card => card.minion.race === race);
                }
            }
        }

        return H.getRandomElement(cards);
    }
};
