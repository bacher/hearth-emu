
const H = require('../namespace');


H.Auras = class Auras {
    constructor(battle) {
        this.list = [];

        this.battle = battle;
    }

    addAura(minion, aura, onlyThisTurn) {
        this.list.push(aura);

        const removeAura = () => {
            minion.removeListener('death', removeAura);
            minion.removeListener('detach', removeAura);

            this.removeAura(aura);
        };

        minion.on('detach', removeAura);
        minion.on('death', removeAura);

        if (onlyThisTurn) {
            this.battle.once('end-turn', removeAura);
        }
    }

    removeAura(aura) {
        const auraIndex = this.list.indexOf(aura);

        if (auraIndex !== -1) {
            this.list.splice(auraIndex, 1);
        } else {
            console.warn('AURA ALREADY REMOVED');
        }
    }

    applyEffect(player, objectType, obj) {
        this.list
            .filter(aura => aura.isTargetSide(player) && aura.isAffect(objectType))
            .forEach(aura => {
                aura.effect(obj);
            });

        return obj;
    }
};
