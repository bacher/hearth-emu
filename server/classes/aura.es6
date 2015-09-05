
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
    constructor(player, auraName, params) {
        this.aura = AURAS[auraName];

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
