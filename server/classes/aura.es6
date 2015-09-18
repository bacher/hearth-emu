
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
        priority: 100
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
        affect: 'minion',
        effect(minion) {
            minion.attack += this.params[0];
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

        this.aura = AURAS[auraInfo.name];
        this.params = auraInfo.params;

        this.targetsType = auraInfo.targetsType;

        /** @type {Hero|Minion|Weapon|null} */
        this.owner = auraInfo.owner || null;

        /** @type {'target'|'own'|'enemy'} */
        this.side = auraInfo.side || this.aura.defaultSide;

        /** @type {?Player} */
        this.affectPlayer = null;

        this.target = null;

        this.effect = this.aura.effect;

        if (this.side === 'target') {
            this.target = auraInfo.target;

        } else if (this.side === 'own') {
            this.affectPlayer = player;

        } else if (this.side === 'enemy') {
            this.affectPlayer = this.player.enemy;
        }
    }

    isTargetPlayerSide(player) {
        return !this.affectPlayer || this.affectPlayer === player;
    }

    isAffect(affect) {
        return this.aura.affect === affect;
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
};
