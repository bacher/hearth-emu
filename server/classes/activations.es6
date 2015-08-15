
const Minion = require('./minion');

module.exports = {
    summon: (card, battle, player) => {
        const newMinion = new Minion(card);

        if (!newMinion.flags.charge) {
            newMinion.flags.sleep = true;
        }

        player.creatures.addCreature(newMinion);
    },

    addMana: param => {

    },

    dealDamage: (card, battle, player) => {},

    overload: (card, battle, player) => {},

    silence: (card, battle, player) => {}
};
