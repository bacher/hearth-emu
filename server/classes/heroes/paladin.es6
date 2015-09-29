
const H = require('../../namespace');

H.Paladin = class Paladin extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['paladin'];

        this.setHeroSkill({
            activation: 'summon',
            params: ['Silver Hand Recruit'],
            additionCheck: () => {
                return H.Conditions.check('can-add-creature', this);
            }
        });
    }
};
