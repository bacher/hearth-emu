
const _ = require('lodash');
const H = require('./namespace');

const A = {
    'summon': function(o) {
        const minionCardName = this.params[0];
        const count = this.params[1] || 1;
        var index = null;

        if (o.minion) {
            const minionPosition = o.player.creatures.indexOf(o.minion);

            if (minionPosition !== -1) {
                if (this.params[2] === 'prev') {
                    index = minionPosition;
                } else {
                    index = minionPosition + 1;
                }
            }
        }

        for (var i = 0; i < count; ++i) {
            const minion = H.Minion.createByName(minionCardName);

            o.player.creatures.addCreature(minion, index);

            o.battle.emit('summon', _.extend({}, o, {
                handCard: null,
                minion: minion
            }));
        }
    },
    'summon-op'(o) {
        o.player = o.player.enemy;

        A['summon'].call(this, o);
    },
    'summon-random': function(o) {
        const minionCardName = H.getRandomElement(this.params);

        A['summon'].call({ params: [minionCardName] }, o);
    },
    'summon-from-hand'(o) {
        const player = this.params[0] === 'op' ? o.player.enemy : o.player;
        const race = H.RACES[this.params[1]];

        const demonsHandCards = player.hand.getAll()
            .filter(handCard => handCard.base.type === H.CARD_TYPES.minion && (!race || handCard.base.minion.race === race));

        const demonHandCard = H.getRandomElement(demonsHandCards);

        if (demonHandCard) {
            player.creatures.addCreature(new H.Minion(null, demonHandCard.base));
            player.hand.removeHandCard(demonHandCard);
        }
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
    'summon-died'(o) {
        o.player.battle._thisTurnDead.forEach(minion => {
            if (minion._lastPlayer === o.player) {
                o.player.creatures.addCreature(new H.Minion(null, minion.card));
            }
        });
    },
    'put-random-deck-secret'(o) {
        const trapCard = o.player.deck.getRandomCards(1, H.CARD_TYPES.trap)[0];

        if (trapCard) {
            const trap = new H.Minion(null, trapCard);

            o.player.deck.removeCard(trap);
            o.player.hero.traps.addTrap(trap);
        }
    },
    'redemption'(o) {
        const minion = o.eventMessage;

        const newMinion = new H.Minion(null, minion.card);
        newMinion.hp = 1;

        o.player.creatures.addCreature(newMinion);
    },
    'add-mana': function(o) {
        o.player.hero.addMana(this.params[0] || 1);
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
    'add-attack-hp'(o) {
        A['add-attack'].call(this, o);
        A['add-hp'].call(this, o);
    },
    'add-hp-for-card-count'(o) {
        const count = o.player.hand.getCount();

        o.minion.hp += count;
        o.minion.maxHp += count;
    },
    'swap-hp'(o) {
        const target = o.targets.getOneMinion();
        const hp = o.minion.hp;

        o.minion.hp = target.hp;
        o.minion.maxHp = target.maxHp;

        target.maxHp = target.hp = hp;
    },
    'add-attack-hp-for-each-played-card'(o) {
        const value = (o.minion.player.getPlayedCardCount() - 1) * 2;

        o.minion.attack += value;
        o.minion.hp += value;
        o.minion.maxHp += value;
    },
    'add-attack-per-target'(o) {
        o.minion.attack += o.targets.getCount();
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
    'deal-self-damage'(o) {
        o.targets.forEach(target => {
            const targetInfo = target.getInfo();

            target.dealDamage(targetInfo.attack);
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

            opWeapon.destroy();
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
    'unlock-overload'(o) {
        o.player.hero.removeOverload();
    },
    'silence': function(o) {
        o.targets.forEach(target => target.silence());
    },
    'kill': function(o) {
        o.targets.forEach(obj => {
            obj.kill();
        });
    },
    'detach': function(o) {
        o.targets.forEach(obj => {
            obj.detach();
        });
    },
    'restore-full-hp': function(o) {
        o.targets.forEach(target => {
            target.hp = target.maxHp;
        });
    },
    'add-flags': function(o) {
        this.params.forEach(flag => {
            o.targets.forEach(target => {
                target.addFlag(flag);
            });
        });
    },
    'remove-flags'(o) {
        this.params.forEach(flag => {
            o.targets.forEach(target => {
                target.removeFlag(flag);
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
    'heal-by-damage'(o) {
        const amount = o.eventMessage.by.getData().attack;

        o.targets.forEach(target => {
            target.heal(amount);
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
    'if-empty-hand'(o) {
        if (o.player.hand.isEmpty()) {
            A[this.params[0]].call({
                params: this.params.slice(1)
            }, o);
        }
    },
    'draw-card-chance'(o) {
        if (Math.random() < this.params[0]) {
            A['draw-card'].apply(this, o);
        }
    },
    'draw-card-op'(o) {
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
            o.player.hand.removeRandomHandCard();
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
    'add-random-hand-minion'(o) {
        const cost = typeof this.params[0] === 'number' ? cost : null;
        const race = typeof this.params[1] === 'string' ? H.RACES[this.params[1]] : null;

        const card = H.CARDS.getRandom(H.CARD_TYPES.minion, cost, race);

        o.baseParams.handCard = o.player.hand.addCard(card);
    },
    'reduce-hand-card-cost'(o) {
        if (o.handCard) {
            o.handCard.reduceCost(3);
        }
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
    'copy-to-hand'(o) {
        o.targets.forEach(minion => {
            o.player.hand.addCard(minion.card);
        });
    },
    'copy-draw-hand'(o) {
        o.player.hand.addCard(o.eventMessage.handCard.base);
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
        const weapon = o.player.hero.weapon;

        if (weapon) {
            weapon.reduceDurability(this.params[0]);
        }
    },
    'reduce-op-weapon-durability'(o) {
        const weapon = o.player.enemy.hero.weapon;

        if (weapon) {
            weapon.reduceDurability(this.params[0]);
        }
    },
    'destroy-weapon': function(o) {
        o.targets.forEach(hero => {
            if (hero.weapon) {
                hero.weapon.destroy();
            }
        });
    },
    'add-charge-if-weapon': function(o) {
        if (o.player.hero.weapon) {
            o.minion.addFlag('charge');
        }
    },
    'add-weapon-attack': function(o) {
        const weapon = o.player.hero.weapon;

        if (weapon) {
            weapon.attack += this.params[0];
        }
    },
    'add-weapon-durability': function(o) {
        const weapon = o.player.hero.weapon;

        if (weapon) {
            weapon.durability += this.params[0];
        }
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

            owner.creatures.replaceMinionByMinion(minion, H.Minion.createByName(this.params[0]));
        });
    },
    'transform-into-random-same-cost'(o) {
        o.targets.forEach(minion => {
            const cost = minion.card.cost;

            const card = H.CARDS.getRandom(H.CARD_TYPES.minion, cost);

            minion.player.creatures.replaceMinionByMinion(minion, new H.Minion(null, card));
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
    'add-random-spell'(o) {
        const spellCard = H.CARDS.getRandom(H.CARD_TYPES.spell);

        o.player.hand.addCard(spellCard);
    },
    'add-random-class-card'(o) {
        const clas = H.CLASSES[this.params[0]];

        o.player.hand.addCard(H.CARDS.getRandom(null, null, null, clas));
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
        const count = this.params[1] || 1;
        var player = o.player;

        if (this.params[0] === 'op') {
            o.player.enemy.hero.addCrystal();
        }

        _.times(count, () => {
            player.hero.addCrystal();
        });
    },
    'destroy-crystal'(o) {
        o.player.hero.removeCrystal();
    },
    'add-copy-to-enemy-hand'(o) {
        const info = o.eventMessage;

        info.player.enemy.hand.addCard(info.handCard.base);
    },
    'put-card-from-deck'(o) {
        const cardType = H.CARD_TYPES[this.params[0]];
        const race = H.RACES[this.params[1]];

        const card = o.player.deck.getRandomCards(1, cardType, race)[0];

        if (card) {
            o.player.hand.addCard(card);

            o.player.deck.removeCard(card);
        }
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
    },
    'add-spare-part'(o) {
        const spareParts = [
            'Armor Plating',
            'Emergency Coolant',
            'Finicky Cloakfield',
            'Reversing Switch',
            'Rusty Horn',
            'Time Rewinder',
            'Whirling Blades'
        ];

        const spareName = H.getRandomElement(spareParts);

        const player = this.params[0] === 'op' ? o.player.enemy : o.player;

        A['add-hand-card'].call({
            params: [spareName]
        }, {
            player
        });
    },
    'discard-deck-card'(o) {
        for (var i = 0; i < this.params[0] || 1; ++i) {
            o.player.deck.popCard();
        }
    },
    'goblin-blastmage'(o) {
        if (o.player.creatures.getAllByRace(H.RACES.mech).length) {
            const targets = [o.player.enemy.hero].concat(o.player.enemy.creatures.getAll());

            _.times(4, () => {
                H.getRandomElement(targets).dealDamage(1);
            });
        }
    },
    'call-pet'(o) {
        const handCard = o.player.drawCard();
        const card = handCard.base;

        if (card.type === H.CARD_TYPES.minion && card.minion.race === H.RACES.beast) {
            handCard.cost = Math.max(0, handCard.cost - 4);
        }
    },
    'destroy-enemy-traps'(o) {
        o.player.enemy.traps.getAll().forEach(tarp => trap.detach());
    },
    'copy-card-give-coin'(o) {
        const handCard = o.eventMessage.handCard;

        o.player.hand.addCard(handCard.base);
        o.player.enemy.hand.addCard(H.CARDS.getByName('The Coin', H.CARD_TYPES.spell));
    },
    'shuffle-into-deck'(o) {
        o.player.deck.shuffleCard(o.minion.card);
    },
    'druid-of-the-fang'(o) {
        const creatures = o.player.creatures;

        if (creatures.getAllByRace(H.RACES.beast).length) {
            creatures.replaceMinionByMinion(o.minion, H.Minion.createByName('Druid of the Fang_'));
        }
    },
    'kill-if-alone'(o) {
        if (o.player.creatures.getCount() === 1) {
            o.minion.kill();
        }
    },
    'demonheart'(o) {
        const minion = o.targets.getOne();

        if (minion.player === o.player && minion.race === H.RACES.demon) {
            minion.attack += 5;
            minion.hp += 5;
            minion.maxHp += 5;
        } else {
            A['deal-spell-damage'].call({
                params: [5]
            }, o);
        }
    },
    'void-terror'(o) {
        const adjacent = o.player.creatures.getAdjacent(o.minion);

        adjacent.forEach(minion => {
            o.minion.attack += minion.attack;
            o.minion.hp += minion.hp;
            o.minion.maxHp += minion.hp;

            minion.kill();
        });
    },
    'bouncing-blade'(o) {
        var minions = o.player.creatures.getAll().concat(o.player.enemy.creatures.getAll());

        minions = minions.filter(minion => !minion.getData().flags['immune']);

        if (minions.length) {
            var target = null;

            while (!target || !target.is('dead')) {
                target = H.getRandomElement(minions);
                target.dealDamage(1);
            }
        }
    },
    'if-race-in-hand-gain-attack-hp'(o) {
        const attack = this.params[1];
        const hp = this.params[2] || attack;

        if (o.player.hand.getAllByRace(H.RACES[this.params[0]]).length) {
            o.minion.attack += attack;
            o.minion.hp += hp;
            o.minion.maxHp += hp;
        }
    },
    'if-race-gain-attack-hp'(o) {
        const attack = this.params[1];
        const hp = this.params[2] || attack;

        if (o.player.creatures.getAllByRace(H.RACES[this.params[0]]).length) {
            o.minion.attack += attack;
            o.minion.hp += hp;
            o.minion.maxHp += hp;
        }
    },
    'if-hold-dragon'(o) {
        if (o.player.hand.getAllByRace(H.RACES.dragon).length) {
            A[this.params[0]].call({
                params: this.params.slice(1)
            }, o);
        }
    },
    'if-opp-less-hp-add-attack-hp'(o) {
        if (o.player.enemy.hero.hp <= this.params[0]) {
            o.minion.attack += this.params[1];
            o.minion.hp += this.params[1];
            o.minion.maxHp += this.params[1];
        }
    },
    'reduce-card-cost'(o) {
        o.player.hand.getAll().forEach(handCard => handCard.reduceCost(this.params[0]));
    },
    'reduce-cost'(o) {

    },
    'revenge'(o) {
        const damage = o.player.hero.hp >= 12 ? 3 : 1;

        o.targets.forEach(target => {
            target.dealDamage(damage);
        });
    },
    'demonwrath'(o) {
        const targets = H.Targets.getAllMinions(o.player);

        targets['non-race'](H.RACES.demon);

        targets.forEach(target => {
            target.dealDamage(2);
        });
    },
    'summon-random-legendary-minion'(o) {
        const card = H.CARDS.getRandomLegendary(H.CARD_TYPES.minion);

        o.player.creatures.addCreature(new H.Minion(null, card));
    },
    'summon-random-minion'(o) {
        const race = this.params[0];
        const cost = this.params[1];

        const card = H.CARDS.getRandom(H.CARD_TYPES.minion, cost, H.RACES[race]);

        o.player.creatures.addCreature(new H.Minion(null, card));
    },
    'animate'(o) {
        o.targets.forEach(target => {
            o.player.battle.addBattleAction({
                name: this.params[0],
                by: o.player.hero.id,
                to: target.id
            });
        });
    },
    'deal-damage-from-event'(o) {
        o.targets.forEach(target => {
            target.dealDamage(o.eventMessage.dmg);
        });
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
