
const BaseMinions = require('../base-minions');

module.exports = {
    summon: (battle, player) => {

        const newMinion = BaseMinions[this.param].spawn();

        player.minions.addMinion(newMinion);
    },

    addMana: param => {

    }
};
