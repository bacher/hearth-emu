
const H = require('../../namespace');

H.Druid = class Druid extends H.Hero {
    constructor(player) {
        super(player);

        this.setHeroSkill({
            name: 'shapeshift',
            activation: 'add-attack-armor',
            params: [1]
        });
    }
};
