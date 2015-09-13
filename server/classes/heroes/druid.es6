
const H = require('../../namespace');

H.Druid = class Druid extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['druid'];

        this._heroSkillCost = 2;
    }

    useHeroSkill() {
        this.armor += 1;

        this.attack = 1;
    }
};
