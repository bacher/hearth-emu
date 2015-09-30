
const H = require('../namespace');


H.Auras = class Auras {
    constructor(battle) {
        this.list = [];

        this.battle = battle;
    }

    addAura(aura, offConditions = {}) {
        this.list.push(aura);

        const owner = aura.getOwner();
        const isOwnerEmitter = owner && !!owner.on;

        const removeAura = player => {
            if (player === aura.player) {
                if (isOwnerEmitter) {
                    owner.removeListener('detach', removeAura);
                }

                if (offConditions.onlyThisTurn) {
                    this.battle.removeListener('end-turn', removeAura);
                }

                this.removeAura(aura);
            }
        };

        if (isOwnerEmitter) {
            owner.on('detach', removeAura);
        }

        if (offConditions.onlyThisTurn) {
            this.battle.on('end-turn', removeAura);
        }

        if (offConditions.onlyOneCard) {
            this.battle.once('play-card', removeAura);
        }
    }

    removeAura(aura) {
        const auraIndex = this.list.indexOf(aura);

        if (auraIndex !== -1) {
            aura.destroy();

            this.list.splice(auraIndex, 1);
        }
    }

    applyEffects(player, object) {
        return this.applyEffect(player, object.objType, object.getBaseData());
    }

    applyEffect(player, objectType, obj) {
        this.list
            .filter(aura => aura.isTargetPlayer(player) && aura.isAffect(objectType) && aura.isTarget(obj.that))
            .forEach(aura => {
                aura.effect(obj);
            });

        return obj;
    }
};
