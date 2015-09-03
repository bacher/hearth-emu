
//const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const H = require('../namespace');


H.Minion = class Minion {
    constructor(player, card) {
        this.player = player;
        this.battle = player.battle;

        Object.defineProperty(this, 'player', { enumerable: false });
        Object.defineProperty(this, 'battle', { enumerable: false });

        this.id = _.uniqueId('minion');

        this.card = card;
        this.base = card.minion;
        this.attack = this.base.attack;
        this.hp = this.base.maxHp;
        this.maxHp = this.base.maxHp;
        this.flags = _.clone(this.base.flags);

        if (!this.base.flags['charge']) {
            this.flags.sleep = true;
        }

        if (this.card.name === 'Wrath of Air Totem') {
            this.aura = new H.Aura(player, 'spellDamage', 1);
            Object.defineProperty(this, 'aura', { enumerable: false });
            this.battle.auras.addAura(this.aura);
        }
    }

    dealDamage(dmg) {
        this.hp -= dmg;

        if (this.hp <= 0) {
            this.hp = 0;

            this.kill();
        }
    }

    kill() {
        if (this.card.name === 'Wrath of Air Totem') {
            this.battle.auras.removeAura(this.aura);
        }

        this.player.creatures.onCreatureDeath(this);
    }

    is(prop) {
        return !!this.flags[prop];
    }
};
