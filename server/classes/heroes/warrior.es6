
const H = require('../../namespace');

H.Warrior = class Warrior extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['warrior'];

        this.heroSkill = {
            actFunc: H.ACTIVATIONS.getByName('add-armor'),
            params: [2]
        };
    }
};
