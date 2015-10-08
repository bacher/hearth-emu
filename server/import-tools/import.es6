
const request = require('request');

const H = require('../namespace');
const hearthpwn = require('./hearthpwn');
const hearthstonetopdecks = require('./hearthstonetopdecks');

exports.extract = function(url) {
    return new Promise((resolve, reject) => {
        var parser = null;

        // http://www.hearthpwn.com/decks/307-miracle-rogue
        if (/^(?:https?:\/\/)(?:www\.)hearthpwn\.com\/decks\/[a-z0-9-]+$/.test(url)) {
            parser = hearthpwn;

        // https://www.hearthstonetopdecks.com/decks/kolentos-season-19-control-priest/
        } else if (/^(?:https?:\/\/)(?:www\.)hearthstonetopdecks\.com\/decks\/[^/]+\/$/.test(url)) {
            parser = hearthstonetopdecks;
        }

        if (parser) {
            request({
                url,
                timeout: 10000
            }, (error, res, body) => {
                if (error) {
                    reject(error);

                } else {
                    try {
                        resolve(makeClientDeck(parser.parse(body)));
                    } catch (e) {
                        reject(e);
                    }
                }
            });

        } else {
            reject();
        }
    });
};

function makeClientDeck(deckInfo) {
    const deck = {
        label: deckInfo.name,
        clas: H.CLASSES[deckInfo.clas],
        cardIds: []
    };

    deckInfo.cards.forEach(cardInfo => {
        const card = H.CARDS.getByName(cardInfo.name, null, true);

        if (card) {
            deck.cardIds.push(card.id);

            if (cardInfo.count === 2) {
                deck.cardIds.push(card.id);
            }
        } else {
            console.warn('Card not found:', cardInfo.name);
        }
    });

    return deck;
}
