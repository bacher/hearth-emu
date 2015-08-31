
const H = require('./namespace');


H.TARGETS = {
    'all': function(battle, player) {
        return {
            my: {
                minions: player.creatures.getAllIds(),
                hero: false
            },
            op :{
                minions: player.getEnemy().creatures.getAllIds(),
                hero: true
            }
        };
    },
    'physic': function(battle, player, minion) {
        const taunts = player.enemy.creatures.getTauntMinions();

        if (taunts.length) {
            return {
                op: {
                    minions: taunts
                }
            };
        } else {
            return {
                op: {
                    minions: player.enemy.creatures.getGameData(),
                    hero: true
                }
            };
        }
    }
};
