
const H = require('../namespace');

const AURAS = {
    'add-spell-damage': {
        affect: 'spell-damage',
        effect(dmg) {
            return dmg + this.params[0];
        },
        side: 'own'
    },
    'multiply-spell-damage': {
        affect: 'spell-damage',
        effect(dmg) {
            return dmg * this.params[0]
        },
        side: 'own'
    }
};

H.Aura = class Aura {
    constructor(player, auraInfo) {
        this.aura = AURAS[auraInfo.name];
        this.params = auraInfo.params;

        this.effect = this.aura.effect;

        this.player = player;

        if (this.aura.side === 'own') {
            this.affectSide = player;
        } else if (this.aura.side === 'enemy') {
            this.affectSide = this.player.enemy;
        } else {
            this.affectSide = null;
        }
    }

    isTargetSide(side) {
        return !this.affectSide || this.affectSide === side;
    }

    isAffect(affect) {
        return this.aura.affect === affect;
    }
};
