
const H = require('./namespace');

const SILENCE_IGNORE_FLAGS = ['tired', 'freeze', 'sleep'];

const A = {
    'summon': function(o) {
        const minionCardName = this.params[0];

        const minion = H.Minion.createByName(minionCardName);

        o.player.creatures.addCreature(minion);
    },
    'card-summon': function(o) {
        const card = H.CARDS.getById(this.params[0]);

        const minion = new H.Minion(card);
        o.handCard.minion = minion;

        o.player.creatures.addCreature(minion);
    },
    'add-mana': function(o) {
        o.player.hero.addMana(1);
    },
    'add-attack': function(o) {
        const amount = this.params[0];
        o.targets.forEach(target => {
            target.attack += amount;
        });
    },
    'add-hp': function(o) {
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
    'deal-spell-damage': function(o) {
        o.targets.forEach(target => {
            const damage = o.battle.auras.applyEffect(o.player, 'spell-damage', this.params[0]);

            target.dealDamage(damage);
        });
    },
    'overload': function(o) {
        o.player.hero.addOverload(this.params[0]);
    },
    'silence': function(o) {
        o.targets.forEach(target => {
            var base = target.base;

            for (var flag in target.flags) {
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
    'kill': function(o) {
        o.targets.forEach(obj => {
            obj.kill();
        });
    },
    'give-deathrattle': function(o) {},
    'restore-full-hp': function(o) {
        o.params.target.hp = o.params.target.maxHp;
    },
    'add-flags': function(o) {
        this.params.forEach(flag => {
            o.targets.forEach(target => {
                target.addFlag(flag);
            });
        });
    },
    'switch-owner': function(o) {
        o.targets.forEach(target => {
            target.detach();

            target.player.enemy.creatures.addCreature(target);
            target.addFlag('sleep');
        });
    },
    'call-totem': function(o) {
        const creatures = o.player.creatures;

        const totemsLeft = o.player.hero.totems.filter(totem => !creatures.hasCardCreature(totem));

        if (totemsLeft.length) {
            const totem = totemsLeft[Math.floor(Math.random() * totemsLeft.length)];

            creatures.addCreature(new H.Minion(totem));
        }
    },
    'heal': function(o) {
        o.targets.forEach(target => {
            target.heal(this.params[0]);
        });
    },
    'x2': function(o) {
        this.params.forEach(field => {
            o.targets.forEach(target => {
                target[field] *= 2;
            });
        });
    },
    'draw-card': function(o) {
        o.player.drawCard();
    },
    'copy-random-enemy-card': function(o) {
        o.player.hand.addCard(o.player.enemy.hand.getRandomHandCard().base);
    },
    'add-armor': function(o) {
        o.player.hero.armor += this.params[0];
    },
    'add-hero-attack': function(o) {
        o.player.hero.attack = this.params[0];
    },
    'return-to-hand': function(o) {
        o.targets.forEach(minion => {
            const player = minion.player;

            minion.detach();

            player.hand.addCard(minion.card);
        });
    },
    'equip-weapon': function(o) {
        const weapon = {
            card: H.CARDS.getByName(this.params[0], H.CARD_TYPES['weapon'])
        };

        weapon.attack = weapon.card.attack;
        weapon.durability = weapon.card.durability;

        o.player.hero.weapon = weapon;
    },
    'add-weapon-attack': function(o) {
        o.player.hero.weapon.attack += this.params[0];
    },
    'frostwolf-warlord': function(o) {
        const minion = o.handCard.minion;
        const otherMinionsCount = o.player.creatures.getCount() - 1;
        minion.attack += otherMinionsCount;
        minion.hp += otherMinionsCount;
        minion.maxHp += otherMinionsCount;
    }
};

H.ACTIVATIONS = {
    getByName(name) {
        if (A[name]) {
            return A[name];
        } else {
            console.warn('ACTIVATION NOT FOUNDED:', name);
            throw 0;
        }
    }
};
