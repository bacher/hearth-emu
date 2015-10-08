

const fs = require('fs');
const request = require('request');

const H = require('../namespace');
const hearthpwn = require('./hearthpwn');

//console.log(hearthpwn.parse(fs.readFileSync('hearthpwn.html', 'utf-8')));

exports.extract = function(url) {
    return new Promise((resolve, reject) => {
        // http://www.hearthpwn.com/decks/307-miracle-rogue
        const match = url.match(/^(?:https?:\/\/)(?:www\.)hearthpwn\.com\/decks\/([a-z0-9-]+)$/);

        if (match) {
            request({
                url,
                timeout: 30000
            }, (error, res, body) => {
                if (error) {
                    reject(error);

                } else {
                    try {
                        resolve(makeClientDeck(hearthpwn.parse(body)));
                    } catch (e) {
                        reject(e);
                    }
                }
            });
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
