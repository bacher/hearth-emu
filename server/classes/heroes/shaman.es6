
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

    canUseSkill() {
        const totemsLeft = this.totems.filter(totem => !this.player.creatures.hasCardCreature(totem));

        return !this.skillUsed && this.mana >= 2 && totemsLeft.length !== 0;
    }
};
