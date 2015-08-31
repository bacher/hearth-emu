
const Minion = require('./minion');

module.exports = {
    all: function(battle, player) {
        return {
            minions: player.creatures.getAllIds().concat(player.getEnemy().creatures.getAllIds()),
            hero: true
        };
    }
};
