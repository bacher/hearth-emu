
const H = require('../../namespace');

H.Druid = class Druid extends H.Hero {
    constructor(player) {
        super(player, 'druid');

        this.setHeroSkill({
            name: 'shapeshift',
            activation: 'add-attack-armor',
            params: [1]
        });
    }
};
