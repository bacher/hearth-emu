
const H = require('../../namespace');

H.Warrior = class Warrior extends H.Hero {
    constructor(player) {
        super(player);

        this.setHeroSkill({
            name: 'armor-up',
            activation: 'add-armor',
            params: [2]
        });
    }
};
