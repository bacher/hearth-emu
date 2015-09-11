
const H = require('./namespace');

const C = {
    'tracking': function(o) {

        const cards = [
            o.player.deck.popCard(),
            o.player.deck.popCard(),
            o.player.deck.popCard()
        ];

        o.player.addOnceMessageListener('card-selection', data => {
            o.player.hand.addCard(cards[data.index]);

            o.player.battle.sendGameData();
        });

        o.player.sendMessage('select-card', {
            cards: cards
        });
    }
};

H.CustomActions = {
    getByName(name) {
        return C[name];
    }
};
