
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

const Aura = require('./aura');

module.exports = class Minion extends EventEmitter {
    constructor(battle, player, card) {
        super();

        this.player = player;
        this.battle = battle;

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
            this.aura = new Aura('spellDamage', {
                own: player,
                power: 1
            });
            battle.auras.push(this.aura);
        }
    }

    onDeath() {
        this.emit('death');

        if (this.card.name === 'Wrath of Air Totem') {
            this.battle.auras.removeAura(this.aura);
        }

        this.battle = null;
        this.player = null;
    }
};
