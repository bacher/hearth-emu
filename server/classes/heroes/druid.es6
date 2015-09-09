
const H = require('../../namespace');

H.Druid = class Druid extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['druid'];
    }

    useHeroSkill() {
        this.armor += 1;

        this.attack = 1;
    }
};
