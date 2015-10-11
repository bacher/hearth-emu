
const H = require('../../namespace');

H.Hunter = class Hunter extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['hunter'];

        this.setHeroSkill({
            name: 'hunter-base',
            activation: 'deal-hero-skill-damage',
            params: [2],
            animation: 'arrow',
            targetsType: {
                names: ['enemies', 'heroes']
            }
        });
    }
};
