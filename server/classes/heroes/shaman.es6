
const H = require('../../namespace');

H.Shaman = class Shaman extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['shaman'];

        this.setHeroSkill('call-totem');

        this.totems = [
            H.CARDS.getByName('Searing Totem'),
            H.CARDS.getByName('Stoneclaw Totem'),
            H.CARDS.getByName('Wrath of Air Totem'),
            H.CARDS.getByName('Healing Totem')
        ];
    }

    _canUseSkill() {
        return (
            H.Conditions.check('can-add-creature', this) &&
            this.totems.some(totem => !this.player.creatures.hasCardCreature(totem))
        );
    }
};
