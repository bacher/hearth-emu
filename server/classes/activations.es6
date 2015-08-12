
const BaseMinions = require('../base-minions');

module.exports = {
    summon: (card, battle, player) => {

        const newMinion = BaseMinions[card.param].spawn();

        player.minions.addMinion(newMinion);
    },

    addMana: param => {

    }
};
