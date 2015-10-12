
const H = require('../../namespace');

H.Mage = class Mage extends H.Hero {
    constructor(player) {
        super(player);

        this.setHeroSkill({
            name: 'fireblast',
            activation: 'deal-hero-skill-damage',
            params: [1],
            animation: 'fireball',
            targets: { names: ['all'] },
            skillNeedTarget: true
        });
    }
};
