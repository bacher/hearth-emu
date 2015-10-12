
const H = require('../../namespace');

H.Druid = class Druid extends H.Hero {
    constructor(player) {
        super(player);

        this.setHeroSkill({
            activation: 'add-attack-armor',
            params: [1]
        });
    }
};
