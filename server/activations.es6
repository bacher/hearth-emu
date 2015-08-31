
const H = require('./namespace');

H.ACTIVATIONS = {
    summon: (card, battle, player) => {
        const newMinion = new H.Minion(player, card);

        player.creatures.addCreature(newMinion);
    },

    addMana: (card, battle, player) => {
        player.hero.addMana(1);
    },

    dealDamage: function(card, battle, player) {
    },

    overload: (card, battle, player) => {},

    silence: (card, battle, player) => {}
};
