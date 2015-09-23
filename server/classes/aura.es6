
const _ = require('lodash');
const H = require('../namespace');

const AURAS = {
    'add-spell-damage': {
        affect: 'spell-damage',
        effect(dmg) {
            return dmg + this.params[0];
        },
        defaultSide: 'own'
    },
    'multiply-spell-damage': {
        affect: 'spell-damage',
        effect(dmg) {
            return dmg * this.params[0];
        },
        defaultSide: 'own',
        priority: 100 // FIXME not work yet
    },
    'attack-equal-hp': {
        affect: 'minion',
        effect(minion) {
            minion.attack = minion.hp;
        },
        defaultSide: 'own',
        priority: 100
    },
    'add-attack': {
        affect: ['minion', 'hero'],
        effect(minion) {
            minion.attack += this.params[0];
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

            card.cost -= reduceBy;

            if (card.cost < minimum) {
                card.cost = minimum;
            }
        }
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

        this.params = auraInfo.params;

        this.targetsType = auraInfo.targetsType;

        /** @type {H.Hero|H.Minion|H.Weapon|null} */
        this.owner = auraInfo.owner || null;

        /** @type {'target'|'own'|'enemy'} */
        this.side = auraInfo.side || aura.defaultSide;

        /** @type {?H.Player} */
        this.affectPlayer = null;

        this.target = null;

        if (this.side === 'target') { // FIXME target ? self ?
            this.target = auraInfo.target;

        } else if (this.side === 'own') {
            this.affectPlayer = player;

        } else if (this.side === 'enemy') {
            this.affectPlayer = this.player.enemy;
        }
    }

    effect() {
        this._effect.apply(this, arguments);
    }

    isTargetPlayerSide(player) {
        return !this.affectPlayer || this.affectPlayer === player;
    }

    isAffect(affect) {
        return _.contains(this.affect, affect);
    }

    isTarget(obj) {
        if (this.target) {
            return this.target === obj;

        } else if (this.targetsType) {
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
