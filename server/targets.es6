
const _ = require('lodash');
const H = require('./namespace');


const T = H.TARGETS = {

    'enemies': function(o) {
        const targets = T['enemy-minions'](o);
        targets.addEnemyHero();

        return targets;
    },

    'minions': function(o) {
        return T['friendly-minions'](o).merge(T['enemy-minions'](o));
    },
    'friendly-minions': function(o) {
        const targets = new H.Targets(o.player);
        targets.addMinions(o.player.creatures.getAll());

        return targets;
    },
    'enemy-minions': function(o) {
        const targets = new H.Targets(o.player);
        targets.addMinions(o.player.enemy.creatures.getAll());

        return targets;
    },
    //FIXME: BAD NAME FOR TARGETS
    'all': function(o) {
        const targets = new H.Targets(o.player);

        targets.addMinions(o.player.creatures.getAll());
        targets.addMinions(o.player.enemy.creatures.getAll());
        targets.addEnemyHero();

        return targets;
    },
    'physic': function(o) {
        const taunts = o.player.enemy.creatures.getTauntMinions();

        if (taunts.length) {
            const targets = new H.Targets(o.player);

            targets.addMinions(taunts);

            return targets;
        } else {
            return T['enemies'](o);
        }
    }
};
