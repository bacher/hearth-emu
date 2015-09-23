
const H = require('../namespace');


H.Auras = class Auras {
    constructor(battle) {
        this.list = [];

        this.battle = battle;
    }

    addAura(aura, onlyThisTurn) {
        this.list.push(aura);

        const owner = aura.getOwner();
        const isOwnerEmitter = owner && !!owner.on;

        const removeAura = () => {
            if (isOwnerEmitter) {
                owner.removeListener('detach', removeAura);
            }

            this.removeAura(aura);
        };

        if (isOwnerEmitter) {
            owner.on('detach', removeAura);
        }

        if (onlyThisTurn) {
            this.battle.once('end-turn', removeAura);
        }
    }

    removeAura(aura) {
        const auraIndex = this.list.indexOf(aura);

        if (auraIndex !== -1) {
            aura.destroy();

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
            .filter(aura => aura.isTargetPlayerSide(player) && aura.isAffect(objectType) && aura.isTarget(obj.that))
            .forEach(aura => {
                aura.effect(obj);
            });

        return obj;
    }
};
