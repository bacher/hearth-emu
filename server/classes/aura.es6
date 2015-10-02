
const _ = require('lodash');
const H = require('../namespace');

const AURAS = {
    'add-spell-damage': {
        affect: 'spell-damage',
        effect(damageInfo) {
            damageInfo.damage += this.params[0];
        },
        defaultSide: 'my'
    },
    'multiply-spell-damage': {
        affect: 'spell-damage',
        effect(damageInfo) {
            damageInfo.damage *= this.params[0];
        },
        defaultSide: 'my',
        priority: 100
    },
    'attack-equal-hp': {
        affect: 'minion',
        effect(minion) {
            minion.attack = minion.hp;
        },
        priority: 100
    },
    'add-attack': {
        affect: ['minion', 'hero'],
        effect(minion) {
            minion.attack += this.params[0];
        }
    },
    'add-attack-while-have-race': {
        affect: 'minion',
        effect(minion) {
            if (minion.player.creatures.getAllByRace(H.RACES[this.params[1]]).length) {
                minion.attack += this.params[0];
            }
        }
    },
    'add-attack-while-op-cards-count': {
        affect: 'minion',
        effect(minion) {
            if (minion.player.enemy.hand.getCount() >= this.params[1]) {
                minion.attack += this.params[0];
            }
        }
    },
    'add-hp': {
        affect: 'minion',
        effect(minion) {
            const amount = this.params[0];

            if (!_.contains(this._affectedMinions, minion.that)) {
                minion.that.bufferHp += amount;
                minion.that.bufferMaxHp += amount;

                this._affectedMinions = this._affectedMinions || [];

                this._affectedMinions.push(minion.that);
            }
        },
        destroy() {
            this._affectedMinions.forEach(minion => {
                minion.bufferMaxHp--;

                if (minion.bufferHp > minion.bufferMaxHp) {
                    minion.bufferHp = minion.bufferMaxHp;
                }
            });
        }
    },
    'add-flags': {
        affect: 'minion',
        effect(target) {
            this.params.forEach(flag => {
                target.flags[flag] = true;
            });
        }
    },
    'reduce-cost': {
        affect: 'hand-card',
        effect(card) {
            const reduceBy = this.params[0];
            const minimum = this.params[1] || 0;
            const type = this.params[2];
            const operation = this.params[3];
            const filter = this.params[4];
            var race;

            if (filter && /^race-/.test(filter)) {
                race = H.RACES[filter.match(/^race-(.+)$/)[1]];
            }

            if ((!type || card.base.type === type) &&
                (!race || card.base.race === race)) {

                if (operation === 'set') {
                    card.cost = reduceBy;
                } else {
                    card.cost -= reduceBy;

                    if (card.cost < minimum) {
                        card.cost = minimum;
                    }
                }
            }
        },
        defaultSide: 'my'
    },
    'reduce-first-minion-cost': {
        affect: 'hand-card',
        effect(handCard) {
            if (handCard.base.type === H.CARD_TYPES.minion) {
                const playedCards = handCard.that.player.getPlayedCards();
                const minionCards = playedCards.filter(card => card.type === H.CARD_TYPES.minion);

                if (minionCards.length === 0) {
                    handCard.cost = Math.max(0, handCard.cost - this.params[0]);
                }
            }
        },
        defaultSide: 'my'
    },
    'enrage': {
        affect: 'minion',
        effect(minion) {
            if (minion.hp < minion.maxHp) {
                AURAS[this.params[0]].effect.apply({
                    params: this.params.slice(1)
                }, arguments);
            }
        }
    },
    'change-minions-cost': {
        affect: 'hand-card',
        effect(handCard) {
            if (handCard.base.type === H.CARD_TYPES.minion) {
                const side = this.params[1];

                if (!side ||
                    (side === 'my' && this.player === handCard.player) ||
                    (side === 'op' && this.player.enemy === handCard.player)
                ) {
                    handCard.cost += this.params[0];
                }
            }
        }
    }
};

H.Aura = class Aura {
    constructor(player, auraInfo) {
        this.player = player;

        const aura = AURAS[auraInfo.name];

        /** @type {string[]} */
        this.affect = H.makeArray(aura.affect);

        /** @type {Function} */
        this._effect = aura.effect;
        /** @type {?Function} */
        this._destroy = aura.destroy;

        this._priority = aura.priority || 0;

        this.params = auraInfo.params;

        this.targetsType = auraInfo.targetsType;

        /** @type {?H.Player} */
        this._affectPlayer = null;

        /** @type {H.Hero|H.Minion|H.Weapon|null} */
        this.owner = auraInfo.owner || null;

        if (!this.targetsType && aura.defaultSide) {
            if (aura.defaultSide === 'my') {
                this._affectPlayer = player;

            } else if (aura.defaultSide === 'op') {
                this._affectPlayer = player.enemy;
            }
        }
    }

    static addAura(player, minion, auraAct, offConditions) {
        const auraInfo = _.clone(auraAct.acts[0]);

        auraInfo.targetsType = auraAct.targetsType;

        if (minion) {
            auraInfo.owner = minion;
        }

        const aura = new H.Aura(player, auraInfo);

        player.battle.auras.addAura(aura, offConditions);
    }

    static addEnrage(player, minion, auraAct) {
        const auraFirstAct = auraAct.acts[0];

        const enrageAura = {
            acts: [
                {
                    name: 'enrage',
                    params: [auraFirstAct.name].concat(auraFirstAct.params)
                }
            ],
            targetsType: {
                names: ['self']
            }
        };

        H.Aura.addAura(player, minion, enrageAura);
    }

    effect() {
        this._effect.apply(this, arguments);
    }

    isAffect(affect) {
        return _.contains(this.affect, affect);
    }

    isTargetPlayer(player) {
        return !this._affectPlayer || this._affectPlayer === player;
    }

    isTarget(obj) {
        if (this.targetsType) {
            const targets = H.TARGETS.getByTargetsType(this.player, this.targetsType, null, this.owner);

            return targets.contains(obj);
        } else {
            return true;
        }
    }

    getOwner() {
        return this.owner;
    }

    destroy() {
        if (this._destroy) {
            this._destroy.apply(this, arguments);
        }
    }
};
