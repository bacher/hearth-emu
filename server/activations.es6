
const H = require('./namespace');

H.ACTIVATIONS = {
    'card-summon': function(o) {
        const newMinion = new H.Minion(o.player, o.params.handCard.base);

        o.player.creatures.addCreature(newMinion);
    },

    'add-mana': function(o) {
        o.player.hero.addMana(1);
    },

    'deal-damage': function(o) {
        o.params.target.dealDamage(o.actParams[0]);
    },

    'overload': function(o) {},

    'silence': function(o) {},

    'gain-crystal-this-turn': function(o) {},

    'summon': function(o) {
        const minionCardName = o.actParams[0];

        const minion = new H.Minion(o.player, H.CARDS.getByName(minionCardName, H.CARD_TYPES.minion));

        o.player.creatures.addCreature(minion);
    }
};
