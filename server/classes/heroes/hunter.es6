
const H = require('../../namespace');

H.Hunter = class Hunter extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['hunter'];

        this.heroSkill = {
            actFunc: H.ACTIVATIONS['deal-damage'],
            params: [2],
            targetsType: {
                names: ['enemies', 'heroes']
            }
        };
    }
};
