
const H = require('./namespace');

H.ACTIVATIONS = {
    'card-summon': function(o) {
        const card = H.CARDS.getById(this.params[0]);
        const newMinion = new H.Minion(o.player, card);

        o.player.creatures.addCreature(newMinion);
    },

    'add-mana': function(o) {
        o.player.hero.addMana(1);
    },

    'deal-damage': function(o) {
        const damage = this.params[0];

        if (this.targets) {
            const targets = H.TARGETS[this.targets]({
                player: o.player
            });

            targets.forEach(target => {
                target.dealDamage(damage);
            });
        } else {
            o.params.target.dealDamage(damage);
        }
    },

    'overload': function(o) {},

    'silence': function(o) {},

    'gain-crystal-this-turn': function(o) {},

    'summon': function(o) {
        const minionCardName = this.params[0];

        const minion = new H.Minion(o.player, H.CARDS.getByName(minionCardName, H.CARD_TYPES.minion));

        o.player.creatures.addCreature(minion);
    },
    'give-attack-race': function(o) {
    },
    'deal-damage-random-enemy-minions': function(o) {},
    'freeze': function(o) {},
    'give-deathrattle': function(o) {},
    '': function(o) {},
    'restore-full-hp': function(o) {
        o.params.target.hp = o.params.target.maxHp;
    },
    'give-flag': function(o) {
        o.params.target.flags[this.params[0]] = true;
    }
};
