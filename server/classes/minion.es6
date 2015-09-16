
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

    _modifyClientData(data) {
        data.pic = data.card.pic;
        delete data.card;
    }

    dealDamage(dmg) {
        dmg = H.parseValue(dmg);

        const eventMessage = {
            to: this,
            dmg: dmg,
            willDie: this.hp <= dmg, //fixme maybe DMG modification
            prevent: false
        };

        this.player.battle.emit('deal-damage', eventMessage);

        if (!eventMessage.prevent) {
            this.hp -= eventMessage.dmg;

            if (this.hp <= 0) {
                this.hp = 0;

                this.kill();
            }
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

        if (flag === 'charge') {
            delete this.flags['sleep'];
        }
    }

};

H.mixGameDataAccessors(H.Minion);
