
const H = require('../../namespace');

H.Druid = class Druid extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['druid'];
    }

    _useSkill() {
        this.armor += 1;

        this.attack = 1;

        this.player.battle.once('turn-end', () => {
            this.attack = 0;
        });
    }
};
