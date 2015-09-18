
const _ = require('lodash');
const H = require('./namespace');

const SILENCE_IGNORE_FLAGS = ['tired', 'freeze', 'sleep'];

const A = {
    'summon': function(o) {
        const minionCardName = this.params[0];
        const count = this.params[1] || 1;
        var index = null;

        if (o.minion) {
            const minionPosition = o.player.creatures.indexOf(o.minion);

            if (minionPosition !== -1) {
                index = minionPosition + 1;
            }
        }

        for (var i = 0; i < count; ++i) {
            const minion = H.Minion.createByName(minionCardName);

            o.player.creatures.addCreature(minion, index);
        }
    },
    'summon-random': function(o) {
        const index = Math.floor(Math.random() * this.params.length);

        const minionCardName = this.params[index];

        A['summon'].call({ params: [minionCardName] }, o);
    },
    'card-summon': function(o) {
        const minion = new H.Minion(o.handCard);
        o.handCard.minion = o.baseParams.minion = o.minion = minion;

        o.player.creatures.addCreature(minion, o.params.index);

        o.battle.emit('summon', o);
    },
    'summon-random-enemy-deck-minion'(o) {
        const cards = o.player.enemy.deck.getRandomCards(1, H.CARD_TYPES.minion);

        if (cards.length) {
            const minion = new H.Minion(null, cards[0]);

            o.player.creatures.addCreature(minion);
        }
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
    'add-attack-of-weapon': function(o) {
        o.targets.forEach(minion => {
            const weapon = minion.player.hero.weapon;

            if (weapon) {
                //FIXME applyFilters
                minion.attack += weapon.attack;
            }
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
    'deal-damage-equal-armor'(o) {
        A['deal-damage'].call({
            params: [o.player.hero.armor]
        }, o);
    },
    'warrior-mortal-strike'(o) {
        const dmg = o.player.hero.hp <= 12 ? 6 : 4;

        A['deal-damage'].call({
            params: [dmg]
        }, o);
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
    'switch-owner-this-turn'(o) {
        o.targets.forEach(target => {
            target.detach();

            target.player.enemy.creatures.addCreature(target);
        });

        o.battle.once('end-turn', () => {
            o.targets.forEach(target => {
                if (!target.is('detached')) {
                    target.detach();

                    target.player.enemy.creatures.addCreature(target);
                }
            });
        });
    },
    'call-totem': function(o) {
        const creatures = o.player.creatures;

        const totemsLeft = o.player.hero.totems.filter(totem => !creatures.hasCardCreature(totem));

        if (totemsLeft.length) {
            const totem = totemsLeft[Math.floor(Math.random() * totemsLeft.length)];

            creatures.addCreature(new H.Minion(null, totem));
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
    'set-attack': function(o) {
        o.targets.forEach(obj => {
            obj.attack = this.params[0];
        });
    },
    'set-attack-equal-hp'(o) {
        o.targets.forEach(obj => {
            obj.attack = obj.getData().hp;
        });
    },
    'set-health': function(o) {
        o.targets.forEach(obj => {
            obj.hp = obj.maxHp = this.params[0];
        });
    },
    'draw-card': function(o) {
        const max = this.params[0] || 1;
        for (var i = 0; i < max; ++i) {
            o.player.drawCard();
        }
    },
    'draw-card-at-each-target'(o) {
        A['draw-card'].call({
            params: [o.targets.getCount()]
        }, o)
    },
    'if-target-alive-draw-card'(o) {
        o.targets.forEach(target => {
            if (!target.is('dead')) {
                A['draw-card'].call(this, o);
            }
        });
    },
    'discard-card': function(o) {
        const max = this.params[0] || 1;
        for (var i = 0; i < max; ++i) {
            o.player.deck.popCard();
        }
    },
    'copy-random-enemy-card': function(o) {
        o.player.hand.addCard(o.player.enemy.hand.getRandomHandCard().base);
    },
    'copy-cards-from-opp-deck'(o) {
        const count = this.params[0];

        o.player.enemy.deck.getRandomCards(count).forEach(card => {
            o.player.hand.addCard(card);
        });
    },
    'add-armor': function(o) {
        o.player.hero.armor += this.params[0];
    },
    'add-hero-attack': function(o) {
        o.player.hero.attack = this.params[0];
    },
    'shadowform'(o) {
        const hero = o.player.hero;

        const dmg = hero._isShadowform ? 3 : 2;

        hero._isShadowform = true;

        hero.setHeroSkill('deal-damage', [dmg], 2, {
            "names": ["all"]
        });
    },
    'return-to-hand': function(o) {
        o.targets.forEach(minion => {
            const player = minion.player;

            minion.detach();

            player.hand.addCard(minion.card);
        });
    },
    'equip-weapon': function(o) {
        const card = H.CARDS.getByName(this.params[0], H.CARD_TYPES['weapon']);

        o.player.hero.equipWeapon(new H.Weapon(card));
    },
    'warrior-upgrade'(o) {
        const weapon = o.player.hero.weapon;
        if (weapon) {
            weapon.attack += 1;
            weapon.durability += 1;

        } else {
            A['equip-weapon'].call({
                params: ['weapon-1-1']
            }, o);
        }
    },
    'destroy-weapon': function(o) {
        o.targets.forEach(hero => {
            hero.destroyWeapon();
        });
    },
    'add-charge-if-weapon': function(o) {
        if (o.player.hero.weapon) {
            o.minion.addFlag('charge');
        }
    },
    'add-weapon-attack': function(o) {
        o.player.hero.weapon.attack += this.params[0];
    },
    'frostwolf-warlord': function(o) {
        const minion = o.minion;
        const otherMinionsCount = o.player.creatures.getCount() - 1;

        minion.attack += otherMinionsCount;
        minion.hp += otherMinionsCount;
        minion.maxHp += otherMinionsCount;
    },
    'draw-card-and-deal-cost-damage': function(o) {
        const handCard = o.player.drawCard();

        if (handCard) {
            o.targets.forEach(target => {
                target.dealDamage(handCard.getData().cost);
            });
        }
    },
    'draw-card-until-less-than-op': function(o) {
        const delta = o.player.enemy.hand.getCount() - o.player.hand.getCount();

        for (var i = 0; i < delta; ++i) {
            o.player.drawCard();
        }
    },
    'add-custom-event': function(o) {
        throw 11;
    },
    'draw-card-deal-self-damage': function(o) {
        o.player.hero.dealDamage(2);
        o.player.drawCard();
    },
    'transform': function(o) {
        o.targets.forEach(minion => {
            const owner = minion.player;

            const index = owner.creatures.indexOf(minion);

            minion.detach();

            owner.creatures.addCreature(H.Minion.createByName(this.params[0]), index);
        });
    },
    'add-hand-card': function(o) {
        o.player.hand.addCard(H.CARDS.getByName(this.params[0], this.params[1]));
    },
    'play-trap-card': function(o) {
        o.player.traps.addTrap(new H.Trap(o.handCard));
    },
    'ice-lance': function(o) {
        o.targets.forEach(target => {
            if (target.is('freeze')) {
                target.dealDamage(this.params[0]);
            } else {
                target.addFlag('freeze');
            }
        });
    },
    'prevent': function(o) {
        o.eventMessage.prevent = true;
    },
    'kill-command': function(o) {
        const beasts = o.player.creatures.getAllByRace(H.RACES['beast']);
        const dmg = beasts.length ? 5 : 3;

        A['deal-damage'].call({ params: [dmg] }, o);
    },
    'far-sight': function(o) {
        const card = o.player.drawCard();

        A['add-aura'].call({
            params: ['reduce-cost', 3, '', 'target']
        }, _.extend(o, {
            targets: [card]
        }));
    },
    'add-aura': function(o) {
        const params = H.parseParams(['auraName', 'auraParam', 'lifeTime', 'side'], this.params);

        const isThisTurn = params.lifeTime === 'this-turn';

        if (o.targets) {
            o.targets.forEach(target => {
                const aura = new H.Aura(target.player, {
                    name: params.auraName,
                    params: [params.auraParam],
                    side: params.side,
                    target: target,
                    owner: target
                });

                o.battle.auras.addAura(aura, isThisTurn);
            });
        } else {
            const aura = new H.Aura(o.player, {
                name: params.auraName,
                params: [params.auraParam],
                side: params.side
            });

            o.battle.auras.addAura(aura, isThisTurn);
        }
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
