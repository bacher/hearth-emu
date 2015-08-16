
//const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

module.exports = class Minion {
    constructor(player, card) {
        this.player = player;
        this.battle = player.battle;

        Object.defineProperty(this, 'player', { enumerable: false });
        Object.defineProperty(this, 'battle', { enumerable: false });

        this.id = _.uniqueId('minion');

        this.card = card;
        this.base = card.minion;
        this.attack = this.base.attack;
        this.maxHp = this.base.maxHp;
        this.flags = _.clone(this.base.flags);

        if (!this.base.flags.charge) {
            this.flags.sleep = true;
        }

        if (this.card.name === 'Wrath of Air Totem') {
            const Aura = require('./aura');

            this.aura = new Aura(player, 'spellDamage', 1);
            Object.defineProperty(this, 'aura', { enumerable: false });
            this.battle.auras.addAura(this.aura);
        }
    }

    onDeath() {
        //this.emit('death');

        if (this.card.name === 'Wrath of Air Totem') {
            this.battle.auras.removeAura(this.aura);
        }

        this.battle = null;
        this.player = null;
    }
};
