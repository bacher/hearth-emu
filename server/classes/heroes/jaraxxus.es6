
const H = require('../../namespace');

H.Jaraxxus = class Jaraxxus extends H.Hero {
    constructor(player) {
        super(player, 'jaraxxus');

        this.maxHp = this.hp = 15;

        this.setHeroSkill({
            name: 'inferno',
            activation: 'summon',
            params: ['Infernal'],
            additionCheck: () => {
                return H.Conditions.check('can-add-creature', this);
            }
        });
    }
};
