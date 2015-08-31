
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

    applyEffect(object) {
        const base = object.getBaseData();

        this.list.forEach(aura => {
            if (aura.affectSide && aura.affectSide !== object.player) {
            } else if (aura.target && !(object instanceof aura.target)) {
            } else {
                aura.effect(base);
            }
        });

        return base;
    }
};
