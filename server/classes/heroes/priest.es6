
const H = require('../../namespace');

H.Priest = class Priest extends H.Hero {
    constructor(player) {
        super(player, 'priest');

        this.setHeroSkill({
            name: 'lesser-heal',
            activation: 'heal',
            params: [2],
            targets: { names: ['all'] },
            skillNeedTarget: true
        });
    }
};
