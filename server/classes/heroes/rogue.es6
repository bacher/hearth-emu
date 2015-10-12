
const H = require('../../namespace');

H.Rogue = class Rogue extends H.Hero {
    constructor(player) {
        super(player);

        this.setHeroSkill({
            name: 'dagger-mastery',
            activation: 'equip-weapon',
            params: ['Wicked Knife']
        });
    }
};
