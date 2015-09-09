
const H = require('../../namespace');

H.Rogue = class Rogue extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['rogue'];

        this.setHeroSkill('equip-weapon', ['Dagger']);
    }
};
