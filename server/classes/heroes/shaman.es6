
const H = require('../../namespace');

H.Shaman = class Shaman extends H.Hero {
    constructor(player) {
        super(player);

        this.clas = H.CLASSES['shaman'];

        this.totems = [
            H.CARDS.getByName('Searing Totem'),
            H.CARDS.getByName('Stoneclaw Totem'),
            H.CARDS.getByName('Wrath of Air Totem'),
            H.CARDS.getByName('Healing Totem')
        ];
    }

    _useSkill() {
        const creatures = this.player.creatures;

        const totemsLeft = this.totems.filter(totem => !creatures.hasCardCreature(totem));

        if (totemsLeft.length) {
            const totem = totemsLeft[Math.floor(Math.random() * totemsLeft.length)];

            creatures.addCreature(new H.Minion(this.player, totem));
        }
    }
};
