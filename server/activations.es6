
const H = require('./namespace');

const SILENCE_IGNORE_FLAGS = ['tired', 'freeze', 'sleep'];

H.ACTIVATIONS = {
    'card-summon': function(o) {
        const card = H.CARDS.getById(this.params[0]);
        const newMinion = new H.Minion(o.player, card);

        o.player.creatures.addCreature(newMinion);
    },

    'add-mana': function(o) {
        o.player.hero.addMana(1);
    },

    'give-attack': function(o) {
        const amount = this.params[0];
        o.targets.forEach(target => {
            target.attack += amount;
        });
    },

    'give-hp': function(o) {
        const amount = this.params[0];

        o.targets.forEach(target => {
            target.maxHp += amount;
            target.hp += amount;
        });
    },

    'deal-damage': function(o) {
        o.targets.forEach(target => {
            target.dealDamage(this.params[0]);
        });
    },

    'overload': function(o) {},

    'silence': function(o) {
        o.targets.forEach(target => {
            var base = target.base;

            for (var flag of target.flags) {
                if (!base.flags[flag] && !_.contains(SILENCE_IGNORE_FLAGS, flag)) {
                    delete target.flags[flag];
                }
            }

            target.maxHp = base.maxHp;
            if (target.hp > target.maxHp) {
                target.hp = target.maxHp;
            }

            target.addFlag('silence');
        });
    },

    'gain-crystal-this-turn': function(o) {
        o.player.hero.mana += 1;
    },

    'summon': function(o) {
        const minionCardName = this.params[0];

        const minion = new H.Minion(o.player, H.CARDS.getByName(minionCardName, H.CARD_TYPES.minion));

        o.player.creatures.addCreature(minion);
    },
    'deal-damage-random-enemy-minions': function(o) {},
    'give-deathrattle': function(o) {},
    '': function(o) {},
    'restore-full-hp': function(o) {
        o.params.target.hp = o.params.target.maxHp;
    },
    'add-flag': function(o) {
        this.params.forEach(flag => {
            o.params.target.flags[flag] = true;
        });
    }
};
