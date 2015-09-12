
const H = require('../namespace');


H.Auras = class Auras {
    constructor(battle) {
        this.list = [];

        this.battle = battle;
    }

    addAura(object, aura, onlyThisTurn) {
        this.list.push(aura);

        const removeAura = () => {
            if (object) {
                object.removeListener('detach', removeAura);
            }

            this.removeAura(aura);
        };

        if (object) {
            object.on('detach', removeAura);
        }

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

    applyEffects(object) {
        return this.applyEffect(object.player, object.objType, object.getBaseData());
    }

    applyEffect(player, objectType, obj) {
        this.list
            .filter(aura => aura.isTargetSide(player) && aura.isAffect(objectType) && aura.isTarget(obj.that))
            .forEach(aura => {
                aura.effect(obj);
            });

        return obj;
    }
};
