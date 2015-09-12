
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
            card.cost -= this.params[0];

            if (card.cost < 0) {
                card.cost = 0;
            }
        }
    }
};

H.Aura = class Aura {
    constructor(player, auraInfo) {
        this.aura = AURAS[auraInfo.name];
        this.params = auraInfo.params;

        this.side = auraInfo.side || this.aura.defaultSide;

        this.affectSide = null;
        this.target = null;

        this.effect = this.aura.effect;

        this.player = player;

        if (this.side === 'target') {
            this.target = auraInfo.target;

        } else if (this.side === 'own') {
            this.affectSide = player;

        } else if (this.side === 'enemy') {
            this.affectSide = this.player.enemy;
        }
    }

    isTargetSide(side) {
        return !this.affectSide || this.affectSide === side;
    }

    isAffect(affect) {
        return this.aura.affect === affect;
    }

    isTarget(obj) {
        return !this.target || this.target === obj;
    }
};
