
const H = require('../../namespace');

H.Priest = class Priest extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['priest'];

        this.setHeroSkill('heal', [2], 2, {
            "names": ["all"],
            "modificators": [{
                "name": "damaged",
                "params": []
            }]
        });

        this.heroSkill.skillNeedTarget = true;

    }
};
