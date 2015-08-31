
const H = require('./namespace');

H.ACTIVATIONS = {
    summon: (handCard, battle, player) => {
        const newMinion = new H.Minion(player, handCard.base);

        player.creatures.addCreature(newMinion);
    },

    addMana: (handCard, battle, player) => {
        player.hero.addMana(1);
    },

    dealDamage: function(handCard, battle, player) {
    },

    overload: (handCard, battle, player) => {},

    silence: (handCard, battle, player) => {},

    spawnCreatures: (handCard, battle, player) => {
        console.log(handCard);

        const card = handCard.base;

        const minionName = card.param[0];
        const count = Number(card.param[1]) || 1;

        for (var i = 0; i < count; ++i) {
            var minion = new H.Minion(player, H.CARDS.getByName(minionName));

            player.creatures.addCreature(minion);
        }
    }
};
