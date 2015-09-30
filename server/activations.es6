
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

            o.battle.emit('summon', _.extend({ minion: minion }, o));
        }
    },
    'summon-op'(o) {
        A['summon'].apply(this, {
            player: o.player.enemy
        });
    },
    'summon-random': function(o) {
        const index = _.random(this.params.length - 1);

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
    'redemption'(o) {
        const minion = o.eventMessage;

        const newMinion = new H.Minion(null, minion.card);
        newMinion.hp = 1;

        o.player.creatures.addCreature(newMinion);
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
    'add-hp-for-card-count'(o) {
        const count = o.player.hand.getCount();

        o.minion.hp += count;
        o.minion.maxHp += count;
    },
    'add-attack-hp-for-each-played-card'(o) {
        const value = (o.minion.player.getPlayedCardCount() - 1) * 2;

        o.minion.attack += value;
        o.minion.hp += value;
        o.minion.maxHp += value;
    },
    'deal-damage': function(o) {
        o.targets.forEach(target => {
            const damage = H.parseValue(this.params[0]);

            target.dealDamage(damage);
        });
    },
    'deal-spell-damage': function(o) {
        const animationName = this.params[1];

        if (animationName) {
            o.battle.addBattleAction({
                name: animationName,
                //by: o.animationBy.id,
                to: o.targets.map(target => target.id)
            });
        }

        o.targets.forEach(target => {
            var damage = H.parseValue(this.params[0]);

            const damageInfo = { damage };
            o.battle.auras.applyEffect(o.player, 'spell-damage', damageInfo);

            target.dealDamage(damageInfo.damage);
        });
    },
    'deal-damage-to-adjacent'(o) {
        const minion = o.targets.getOne().getData();

        o.targets.adjacent().forEach(target => {
            target.dealDamage(minion.attack);
        });
    },
    'deal-damage-equal-armor'(o) {
        A['deal-damage'].call({
            params: [o.player.hero.armor]
        }, o);
    },
    'deal-damage-by-event'(o) {
        const damage = o.eventMessage.dmg;

        o.targets.forEach(target => {
            target.dealDamage(damage);
        });
    },
    'deal-weapon-damage'(o) {
        const weapon = o.player.hero.weapon;

        A['deal-damage'].call({
            params: [weapon.attack]
        }, o);
    },
    'deal-hero-attack'(o) {
        A['deal-damage'].apply({
            params: [o.player.hero.attack]
        }, o);
    },
    'destroy-op-weapon-draw-cards'(o) {
        const opWeapon = o.player.enemy.hero.weapon;

        if (opWeapon) {
            A['draw-card'].apply({
                params: [opWeapon.durability]
            }, o);

            opWeapon.detachWeapon();
        }
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
    'remove-buffered-flags'(o) {
        this.params.forEach(flag => {
            o.targets.forEach(target => {
                if (!target.base.flags[flag]) {
                    delete target.flags[flag];
                }
            });
        });
    },
    'switch-owner': function(o) {
        o.targets.forEach(target => {
            const player = target.player;

            target.detach();
            player.enemy.creatures.addCreature(target);
            target.addFlag('sleep');
        });
    },
    'switch-owner-this-turn'(o) {
        o.targets.forEach(target => {
            const prevPlayer = target.player;
            target.detach();

            prevPlayer.enemy.creatures.addCreature(target);

            o.battle.once('end-turn', () => {
                if (!target.is('detached')) {
                    target.detach();

                    prevPlayer.creatures.addCreature(target);
                }
            });
        });
    },
    'call-totem': function(o) {
        const creatures = o.player.creatures;

        const totemsLeft = o.player.hero.totems.filter(totem => !creatures.hasCardCreature(totem));

        if (totemsLeft.length) {
            const totem = H.getRandomElement(totemsLeft);

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
    'swap-attack-hp'(o) {
        o.targets.forEach(target => {
            [target.hp, target.attack] = [target.attack, target.hp];
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
    'set-hp': function(o) {
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
    'draw-card-chance'(o) {
        if (Math.random() < this.params[0]) {
            A['draw-card'].apply(this, o);
        }
    },
    'opp-draw-card'(o) {
        A['draw-card'].apply(this, { player: o.player.enemy });
    },
    'draw-card-at-each-target'(o) {
        A['draw-card'].call({
            params: [o.targets.getCount()]
        }, o);
    },
    'if-target-alive-draw-card'(o) {
        o.targets.forEach(target => {
            if (!target.is('dead')) {
                A['draw-card'].call(this, o);
            }
        });
    },
    'discard-hand': function(o) {
        o.player.hand.empty();
    },
    'warlock-shadowflame'(o) {
        o.targets.each(target => {
            const attack = target.getData().attack;

            target.kill();

            A['deal-damage'].call({
                params: [attack]
            }, {
                targets: H.TARGETS.getTargets(o.player, 'enemy-minions')
            });
        });
    },
    'discard-random-hand-card': function(o) {
        const max = this.params[0] || 1;

        for (var i = 0; i < max; ++i) {
            o.player.removeRandomHandCard();
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
    'add-attack-armor'(o) {
        const hero = o.player.hero;

        hero.attack++;
        hero.armor++;
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
    'warlock-sense-demons'(o) {
        const deck = o.player.deck;

        const deckCards = deck.getRandomCards(2, null, H.RACES.demon);

        deck.removeCards(deckCards);

        deckCards.forEach(deckCard => {
            o.player.hand.addCard(deckCard.card);
        });
    },
    'warlock-demonfire'(o) {
        o.targets.forEach(target => {
            if (target.race === H.RACES.demon && target.player === o.player) {
                target.attack += 2;
                target.maxHp += 2;
                target.hp += 2;
            } else {
                target.dealDamage(2);
            }
        });
    },
    'return-to-hand': function(o) {
        o.targets.forEach(minion => {
            const player = minion.player;

            minion.detach();

            player.hand.addCard(minion.card);
        });
    },
    'return-to-hand-reduce-cost'(o) {
        o.targets.forEach(minion => {
            const player = minion.player;

            minion.detach();

            const handCard = player.hand.addCard(minion.card);

            handCard.cost = Math.max(0, handCard.cost - this.params[0]);
        });
    },
    'equip-weapon': function(o) {
        const card = H.CARDS.getByName(this.params[0], H.CARD_TYPES['weapon']);

        o.player.hero.equipWeapon(new H.Weapon(card));
    },
    'equip-weapon-card'(o) {
        o.player.hero.equipWeapon(new H.Weapon(o.handCard.base));
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
    'reduce-weapon-durability'(o) {
        o.player.hero.weapon.reduceDurability(this.params[0]);
    },
    'reduce-op-weapon-durability'(o) {
        o.player.enemy.hero.weapon.reduceDurability(this.params[0]);
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
    'add-weapon-durability': function(o) {
        o.player.hero.weapon.durability += this.params[0];
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
        if (o.targets && o.targets.getCount()) {
            o.targets.forEach(target => {
                target.addCustomEvent(new H.Command(o.customEvent));
            });
        } else {
            o.player.hero.addCustomEvent(new H.Command(o.customEvent));
        }
    },
    'draw-card-deal-self-damage': function(o) {
        o.player.hero.dealDamage(2);
        o.player.drawCard();
    },
    'transform': function(o) {
        o.targets.forEach(minion => {
            const owner = minion.player;

            owner.creatures.replaceMinionByMinion(minion, H.Minion.createByName(this.params[0]))
        });
    },
    'tinkmaster-transform'(o) {
        const replaceByName = Math.random() < 0.5 ? 'Squirrel' : 'Devilsaur';

        A['transform'].call({
            params: [replaceByName]
        }, o);
    },
    'replace-self-by-target'(o) {
        const target = o.targets.getOne();

        o.minion.player.creatures.replaceMinionByMinion(o.minion, new H.Minion(null, target.card));
    },
    'add-hand-card': function(o) {
        o.player.hand.addCard(H.CARDS.getByName(this.params[0], this.params[1] || null));
    },
    'add-op-hand-card': function(o) {
        A['add-hand-card'].apply(this, {
            player: o.player.enemy
        });
    },
    'play-trap-card': function(o) {
        o.player.traps.addTrap(new H.Trap(o.handCard));
    },
    'ice-lance': function(o) {
        o.targets.forEach(target => {
            if (target.is('freeze')) {
                A['deal-spell-damage'].call(this, o);
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
    'add-crystal'(o) {
        if (this.params[0] === 'op') {
            o.player.enemy.hero.addCrystal();
        } else {
            o.player.hero.addCrystal();
        }
    },
    'destroy-crystal'(o) {
        o.player.hero.removeCrystal();
    },
    'add-copy-to-enemy-hand'(o) {
        const info = o.eventMessage;

        info.player.enemy.hand.addCard(info.handCard.base);
    },
    'add-aura': function(o) {
        const offConditions = {};
        var owner = o.player;

        if (_.contains(this.params, 'this-turn')) {
            offConditions.onlyThisTurn = true;
        }

        if (_.contains(this.params, 'enemy-turn')) {
            offConditions.onlyThisTurn = true;
            owner = o.player.enemy;
        }

        if (_.contains(this.params, 'play-card')) {
            offConditions.onlyOneCard = true;
        }

        const auraDetails = _.clone(o.aura);

        if (o.targets) {
            o.targets.forEach(target => {
                H.Aura.addAura(owner, target, auraDetails, offConditions);
            });

        } else {
            H.Aura.addAura(owner, null, auraDetails, offConditions);
        }
    },
    'swap-with-random-hand-card-minion'(o) {
        o.targets.forEach(target => {
            const handCard = target.player.hand.getRandomHandCard(H.CARD_TYPES.minion);

            if (handCard) {
                const minion = new H.Minion(null, handCard.base);
                minion.removeFlag('sleep');

                target.player.creatures.replaceMinionByMinion(target, minion);
            }
        });
    },
    'remove-shields-gain-attack-hp'(o) {
        const amount = this.params[0];

        o.targets.forEach(minion => {
            if (minion.is('shield')) {
                minion.removeFlag('shield');

                o.minion.attack += amount;
                o.minion.hp += amount;
                o.minion.maxHp += amount;
            }
        });
    },
    'mind-control-tech'(o) {
        const enemyCreatures = o.minion.player.enemy.creatures;

        if (enemyCreatures.getCount() >= 4) {
            const minion = enemyCreatures.getRandomMinion();

            A['switch-owner'].call(this, {
                targets: [minion]
            });
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
