
const _ = require('lodash');
const H = require('./namespace');


H.TARGETS = {
    getTargets(name, params) {
        return T[name](params);
    },

    mix(player, targetsType) {
        const allTargets = targetsType.names.map(name => H.TARGETS.get(name, {
            player
        }));

        const targets = allTargets.reduce((base, nextTarget) => {
            return base[targetsType.mergeType](nextTarget);
        });

        if (targetsType.modificators) {
            targetsType.modificators.forEach(mod => {
                targets[mod.name](...mod.params);
            });
        }

        return targets;
    }
};

const T = {
    'enemies': function(player) {
        const targets = T['enemy-minions'](player);
        targets.addMinions(player.enemy.creatures.getAll());
        targets.addEnemyHero();

        return targets;
    },
    'minions': function(player) {
        return T['friendly-minions'](player).merge(T['enemy-minions'](player));
    },
    'totems': function(player) {
        const targets = new H.Targets(player);

        targets.addMinions(player.creatures.getAllByRace(H.RACES['totem']));

        return targets;
    },
    'friendly': function(player) {
        const targets = new H.Targets(player);
        targets.addMinions(player.creatures.getAll());
        targets.addMyHero();

        return targets;
    },
    'friendly-minions': function(player) {
        const targets = new H.Targets(player);
        targets.addMinions(player.creatures.getAll());

        return targets;
    },
    'enemy-minions': function(player) {
        const targets = new H.Targets(player);
        targets.addMinions(player.enemy.creatures.getAll());

        return targets;
    },
    //FIXME: BAD NAME FOR TARGETS
    'all': function(player) {
        const targets = new H.Targets(player);

        targets.addMinions(player.creatures.getAll());
        targets.addMinions(player.enemy.creatures.getAll());
        targets.addEnemyHero();

        return targets;
    },
    'physic': function(player) {
        const taunts = player.enemy.creatures.getTauntMinions();

        if (taunts.length) {
            const targets = new H.Targets(player);

            targets.addMinions(taunts);

            return targets;
        } else {
            return T['enemies'](player);
        }
    }
};
