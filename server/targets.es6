
const _ = require('lodash');
const H = require('./namespace');


const T = H.TARGETS = {

    'enemies': function(o) {
        const ret = T['enemy-minions'](o);
        ret.op.hero = true;

        return ret;
    },

    'minions': function(o) {
        return _.extend(T['friendly-minions'](o), T['enemy-minions'](o));
    },
    'friendly-minions': function(o) {
        return {
            my: {
                minions: o.player.creatures.getAllIds()
            }
        };
    },
    'enemy-minions': function(o) {
        return {
            op: {
                minions: o.player.enemy.creatures.getAllIds()
            }
        };
    },
    'all': function(o) {
        return {
            my: {
                minions: o.player.creatures.getAllIds()
            },
            op :{
                minions: o.player.enemy.creatures.getAllIds(),
                hero: true
            }
        };
    },
    'physic': function(o) {
        const taunts = o.player.enemy.creatures.getTauntMinions();

        if (taunts.length) {
            return {
                op: {
                    minions: taunts
                }
            };
        } else {
            return T['enemies'](o);
        }
    }
};
