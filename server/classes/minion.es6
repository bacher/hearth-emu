
const _ = require('lodash');
const H = require('../namespace');


H.Minion = class Minion extends H.GameObject {
    constructor(handCard, card) {
        super(handCard, card);

        this.objType = 'minion';

        this.id = _.uniqueId('minion');

        this.base = this.card.minion;
        this.attack = this.base.attack;
        this.hp = this.base.maxHp;
        this.maxHp = this.base.maxHp;

        this.hpBuffers = [];

        this.flags = _.clone(this.base.flags);
        this.race = this.base.race;
        this.events = {};

        if (!this.base.flags['charge']) {
            this.flags['sleep'] = true;
        }
    }

    static createByName(name) {
        return new H.Minion(null, H.CARDS.getByName(name, H.CARD_TYPES.minion));
    }

    getBaseData() {
        const data = {};
        ['id', 'card', 'base', 'attack', 'hp', 'maxHp', 'race'].forEach(prop => {
            data[prop] = this[prop];
        });

        data.flags = this.getFlags();
        data.that = this;

        return data;
    }

    _modifyData(data) {
        this.hpBuffers.forEach(buffer => {
            data.hp += buffer.hp;
            data.maxHp += buffer.maxHp; // TODO проверить как работает аура если моба ударить, а потом отхилить обратно.
        });
    }

    _modifyClientData(data) {
        data.pic = data.card.pic;

        delete data.card;
        delete data.base;
        delete data.race;
        delete data.maxHp;
    }

    dealDamage(dmg) {
        dmg = H.parseValue(dmg);

        const minionDetails = this.getData();

        const eventMessage = {
            to: this,
            dmg: dmg,
            willDie: minionDetails.hp <= dmg, //fixme maybe DMG modification
            prevent: false
        };

        this.player.battle.emit('deal-damage', eventMessage);

        if (!eventMessage.prevent) {
            this._dealDamage(dmg);
        }
    }

    _dealDamage(dmg) {
        this.hpBuffers.forEach(buffer => {
            if (buffer.hp) {
                buffer.hp -= dmg;

                if (buffer.hp < 0) {
                    dmg = -buffer.hp;
                    buffer.hp = 0;
                } else {
                    dmg = 0;
                }
            }
        });

        this.hp -= dmg;

        if (this.hp <= 0) {
            this.hp = 0;

            this.kill();
        }
    }

    heal(amount) {
        if (this.hp < this.maxHp) {
            this.hp = Math.min(this.maxHp, this.hp + amount);

            this.player.battle.emit('heal', this);
        }
    }

    addFlag(flag) {
        this.flags[flag] = true;

        if (flag === 'charge') {
            delete this.flags['sleep'];
        }
    }

};

H.mixGameDataAccessors(H.Minion);
