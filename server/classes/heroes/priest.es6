
const H = require('../../namespace');

H.Priest = class Priest extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['priest'];

        this.setHeroSkill({
            activation: 'heal',
            params: [2],
            targets: { names: ['all'] },
            skillNeedTarget: true
        });
    }
};
