
const H = require('../../namespace');

H.Hunter = class Hunter extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['hunter'];

        this.setHeroSkill('deal-damage', [2], 2, {
            names: ['enemies', 'heroes']
        });
    }
};
