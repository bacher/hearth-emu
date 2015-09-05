
const H = require('../../namespace');

H.Warrior = class Warrior extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['warrior'];

        this.heroSkill = {
            actFunc: H.ACTIVATIONS['add-armor'],
            params: [2]
        };
    }
};
