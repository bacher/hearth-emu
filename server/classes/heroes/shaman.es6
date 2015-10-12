
const H = require('../../namespace');

H.Shaman = class Shaman extends H.Hero {
    constructor(player) {
        super(player, 'shaman');

        this.totems = [
            H.CARDS.getByName('Searing Totem'),
            H.CARDS.getByName('Stoneclaw Totem'),
            H.CARDS.getByName('Wrath of Air Totem'),
            H.CARDS.getByName('Healing Totem')
        ];

        this.setHeroSkill({
            name: 'totemic-call',
            activation: 'call-totem',
            additionCheck: () => {
                return (
                    H.Conditions.check('can-add-creature', this) &&
                    this.totems.some(totem => !this.player.creatures.hasCardCreature(totem))
                );
            }
        });
    }
};
