
const H = require('../../namespace');

H.Warlock = class Warlock extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['warlock'];

        this.setHeroSkill({
            activation: 'draw-card-deal-self-damage',
            params: [2]
        });
    }
};
