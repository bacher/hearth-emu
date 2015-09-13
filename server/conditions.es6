
const H = require('./namespace');

const C = {
    'can-add-creature'(handCard) {
        return handCard.player.creatures.canAddCreature();
    }
};

H.Conditions = {
    check(name, handCard) {
        if (!C[name]) {
            console.warn('CONDITION NOT FOUND, NAME:', name);
            throw 1;
        }

        return C[name](handCard);
    }
};
