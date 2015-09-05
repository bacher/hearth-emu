
const H = require('../namespace');


H.Auras = class Auras {
    constructor(battle) {
        this.list = [];

        this.battle = battle;
    }

    addAura(aura) {
        this.list.push(aura);
    }

    removeAura(aura) {
        this.list.splice(this.list.indexOf(aura), 1);
    }

    applyEffect(player, objectType, obj) {
        return this.list
            .filter(aura => aura.isTargetSide(player) && aura.isAffect(objectType))
            .reduce((base, aura) => {
                return aura.effect(obj);
            }, obj);
    }
};
