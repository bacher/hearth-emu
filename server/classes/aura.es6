
const H = require('../namespace');

const AURAS = {
    'spell-damage': {
        effect: hero => hero.spellDamage++,
        side: 'own',
        target: H.Hero
    },
    'prophet-velen': {
        effect: spell => {

        },
        side: 'both',
        target: ''
    }
};

H.Aura = class Aura {
    constructor(player, auraName, params) {
        this.aura = AURAS[auraName];
        this.player = player;
        this.effect = this.aura.effect;

        if (this.aura.side === 'own') {
            this.affectSide = player;
        } else if (this.aura.side === 'enemy') {
            this.affectSide = this.player.getEnemy();
        } else {
            this.affectSide = null;
        }
    }

    isTarget(instance) {
        const target = this.aura.target;
        if (target) {
            return instance instanceof target;
        } else {
            return true;
        }
    }
};
