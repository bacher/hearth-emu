
const H = require('../../namespace');

H.Warlock = class Warlock extends H.Hero {
    constructor(player) {
        super(player, 'warlock');

        this.setHeroSkill({
            name: 'life-tap',
            activation: 'draw-card-deal-self-damage',
            params: [2]
        });
    }
};
