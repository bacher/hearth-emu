
const H = require('./namespace');

H.ACTIVATIONS = {
    'card-summon': (data, actParams, battle, player) => {
        const newMinion = new H.Minion(player, data.handCard.base);

        player.creatures.addCreature(newMinion);
    },

    'add-mana': (data, actParams, battle, player) => {
        player.hero.addMana(1);
    },

    'deal-damage': function(data, actParams, battle, player) {
        data.targetPlayer.creatures.killCreature(data.target);
    },

    'overload': (data, actParams, battle, player) => {},

    'silence': (data, actParams, battle, player) => {},

    'gain-crystal-this-turn': () => {},

    'summon': (data, actParams, battle, player) => {
        const card = data.handCard.base;

        const minionName = card.param[0];
        const count = Number(card.param[1]) || 1;

        for (var i = 0; i < count; ++i) {
            var minion = new H.Minion(player, H.CARDS.getByName(minionName));

            player.creatures.addCreature(minion);
        }
    }
};
