
const H = require('../../namespace');

H.Shaman = class Shaman extends H.Hero {
    constructor(player) {
        super(player, 'shaman');

        this.setHeroSkill({
            name: 'totemic-call',
            activation: 'call-totem',
            additionCheck: () => {
                const totems = [
                    H.CARDS.getByName('Searing Totem'),
                    H.CARDS.getByName('Stoneclaw Totem'),
                    H.CARDS.getByName('Wrath of Air Totem'),
                    H.CARDS.getByName('Healing Totem')
                ];

                return (
                    H.Conditions.check('can-add-creature', this) &&
                    totems.some(totem => !this.player.creatures.hasCardCreature(totem))
                );
            }
        });
    }
};
