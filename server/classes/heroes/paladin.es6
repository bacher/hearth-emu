
const H = require('../../namespace');

H.Paladin = class Paladin extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['paladin'];

        this.setHeroSkill('summon', ['Silver Hand Recruit']);
    }

    _useSkill() {
        H.ACTIVATIONS.getByName('summon')();
        this.armor += 1;

        this.attack = 1;

        this.player.battle.once('end-turn', () => {
            this.attack = 0;
        });
    }

    _canUseSkill() {
        return H.Conditions.check('can-add-creature', this);
    }
};
