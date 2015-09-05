
const H = require('../../namespace');

H.Priest = class Priest extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['priest'];

        this.heroSkill = {
            actFunc: H.ACTIVATIONS['heal'],
            params: [2],
            skillTargetsType: {
                names: ['all']
            }
        };
    }
};
