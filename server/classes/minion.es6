
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
        this.bufferHp = 0;
        this.bufferMaxHp = 0;

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
        data.hp += this.bufferHp;
        data.maxHp += this.bufferMaxHp;
    }

    _modifyClientData(data) {
        data.pic = data.card.pic;

        delete data.card;
        delete data.base;
        delete data.race;
        delete data.maxHp;
    }

    dealDamage(dmg) {
        const minionDetails = this.getData();

        const eventMessage = {
            to: this,
            dmg: dmg,
            willDie: minionDetails.hp <= dmg, //fixme maybe DMG modification
            prevent: false
        };

        this.player.battle.emit('deal-damage', eventMessage);

        if (!eventMessage.prevent) {
            this.player.battle.addBattleAction({
                name: 'damage',
                to: this.id,
                amount: dmg
            });

            this._dealDamage(dmg);
        }
    }

    _dealDamage(dmg) {
        this.bufferHp -= dmg;

        if (this.bufferHp < 0) {
            this.hp += this.bufferHp;
            this.bufferHp = 0;

            if (this.hp <= 0) {
                this.hp = 0;

                this.kill();
            }
        }
    }

    heal(amount) {
        if (this.hp === this.maxHp && this.bufferHp === this.bufferMaxHp) {
            return;
        }

        const mayHealHp = this.maxHp - this.hp;

        if (mayHealHp >= amount) {
            this.hp += amount;

        } else {
            this.hp += mayHealHp;

            const mayHealBufferHp = this.bufferMaxHp - this.bufferHp;

            this.bufferHp += Math.min(mayHealBufferHp, amount - mayHealHp);
        }

        this.player.battle.emit('heal', this);
    }

    addFlag(flag) {
        this.flags[flag] = true;

        if (flag === 'charge') {
            delete this.flags['sleep'];
        }
    }

};

H.mixGameDataAccessors(H.Minion);
