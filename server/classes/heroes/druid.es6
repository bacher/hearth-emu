
const H = require('../../namespace');

H.Druid = class Druid extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['druid'];

        this.setHeroSkill({
            activation: 'add-attack-armor',
            params: [1]
        });
    }
};
