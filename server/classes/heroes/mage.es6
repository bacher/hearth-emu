
const H = require('../../namespace');

H.Mage = class Mage extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['mage'];

        this.setHeroSkill({
            activation: 'deal-damage',
            params: [1],
            animation: 'fireball',
            cost: 2,
            targets: { names: ['all'] },
            skillNeedTarget: true
        });
    }
};
