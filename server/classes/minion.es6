
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const H = require('../namespace');


H.Minion = class Minion extends EventEmitter {
    constructor(card) {
        super();

        this.id = _.uniqueId('minion');

        this.card = card;
        this.base = card.minion;
        this.attack = this.base.attack;
        this.hp = this.base.maxHp;
        this.maxHp = this.base.maxHp;
        this.flags = _.clone(this.base.flags);
        this.race = this.base.race;

        this._auras = [];
        Object.defineProperty(this, '_auras', { enumerable: false });

        if (!this.base.flags['charge']) {
            this.flags['sleep'] = true;
            this.flags['tired'] = true;
        }
    }

    static createByName(name) {
        return new H.Minion(H.CARDS.getByName(name, H.CARD_TYPES.minion));
    }

    getData() {
        return this.player.battle.auras.applyEffect(this.player, 'minions', this.getBaseData());
    }

    getBaseData() {
        const data = {};
        ['id', 'card', 'base', 'attack', 'hp', 'maxHp', 'flags', 'race'].forEach(prop => {
            data[prop] = this[prop];
        });
        data.that = this;
        return data;
    }

    enterInGame(player) {
        this.player = player;
        Object.defineProperty(this, 'player', { enumerable: false });

        for (var eventName in this.base.events) {
            const eventInfo = this.base.events[eventName];

            if (eventName === 'aura') {
                const aura = new H.Aura(player, eventInfo);

                this.player.battle.auras.addAura(this, aura);
            }
        }
    }

    wakeUp() {
        delete this.flags['sleep'];
        delete this.flags['windfury-hit'];

        if (!this.flags['freeze']) {
            delete this.flags['tired'];
        }
    }

    setHitFlags() {
        if (this.flags['windfury'] && !this.flags['windfury-hit']) {
            this.flags['windfury-hit'] = true;
        } else {
            this.flags['tired'] = true;
        }
    }

    dealDamage(dmg) {
        if (/\d+-\d+/.test(dmg)) {
            const dmgRandom = dmg.split('-').map(Number);

            dmg = dmgRandom[0] + Math.floor(Math.random() * (dmgRandom[1] - dmgRandom[0]));
        }

        this.hp -= dmg;

        if (this.hp <= 0) {
            this.hp = 0;

            this.kill();
        }
    }

    heal(amount) {
        this.hp += amount;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    addFlag(flag) {
        this.flags[flag] = true;
    }

    detach() {
        this.emit('detach', this);

        this.player = null;
    }

    kill() {
        this.emit('death', this);
    }

    is(prop) {
        return !!this.flags[prop];
    }
};
