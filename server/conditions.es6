
const H = require('./namespace');

const C = {
    'can-add-creature'(player) {
        return player.creatures.canAddCreature();
    },
    'has-weapon'(player) {
        return !!player.hero.weapon;
    }
};

H.Conditions = {
    check(name, obj) {
        if (!C[name]) {
            console.warn('CONDITION NOT FOUND, NAME:', name);
            throw 1;
        }

        if (obj.objType !== 'player') {
            obj = obj.player;
        }

        return C[name](obj);
    }
};
