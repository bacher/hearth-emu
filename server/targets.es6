
const _ = require('lodash');
const H = require('./namespace');

const T = {
    'heroes': function(player) {
        const targets = new H.Targets(player);

        targets.addMyHero();
        targets.addEnemyHero();

        return targets;
    },
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
    'friends': function(player) {
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
    'all': function(player) {
        const targets = new H.Targets(player);

        targets.addMyHero();
        targets.addMinions(player.creatures.getAll());

        targets.addEnemyHero();
        targets.addMinions(player.enemy.creatures.getAll());

        return targets;
    },
    'all-but-my-hero': function(player) {
        const targets = T['all'](player);

        targets.removeMyHero();

        return targets;
    },
    'except-self': function(player, minion) {
        const targets = T['all'](player);

        targets.removeMinion(minion);

        return targets;
    },
    'self': function(player, minion) {
        const targets = new H.Targets(player);

        targets.addMinion(minion);

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

H.TARGETS = {
    getTargets(player, name) {
        if (!T[name]) {
            console.warn('Not founded:', name);
            throw 1;
        }

        return T[name](player);
    },

    getByTargetsType(player, targetsType, handCard, minion) {
        minion = minion || (handCard && handCard.minion);

        const allTargets = targetsType.names.map(name => T[name](player, minion));

        const targets = allTargets.reduce((base, nextTarget) => {
            return base.intersect(nextTarget);
        });

        targets.applyModificators(targetsType.modificators);

        return targets;
    }
};
