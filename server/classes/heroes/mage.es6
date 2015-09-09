
const H = require('../../namespace');

H.Mage = class Mage extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['mage'];

        this.setHeroSkill('deal-damage', [1], { names: ['all'] });
        this.heroSkill.skillNeedTarget = true;
    }
};
