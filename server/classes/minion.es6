
const _ = require('lodash');
const H = require('../namespace');

const SILENCE_IGNORE_FLAGS = ['tired', 'freeze', 'sleep'];

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

        if (data.hp < data.maxHp) {
            data.flags['damaged'] = true;

        } else if (data.maxHp > data.base.maxHp) {
            data.flags['hp-upped'] = true;
        }

        if (data.attack > data.base.attack) {
            data.flags['attack-upped'] = true;

        } else if (data.attack < data.base.attack) {
            data.flags['attack-reduced'] = true;
        }

        if (this.player.active && data.attack > 0 && !data.flags['tired']) {
            data.flags['can-play'] = true;
        }

        delete data.card;
        delete data.base;
        delete data.race;
        delete data.maxHp;
    }

    dealDamage(dmg) {
        const minionDetails = this.getData();

        if (minionDetails.flags['immune']) {
            return;
        }

        const eventMessage = {
            to: this,
            dmg: dmg,
            willDie: minionDetails.hp <= dmg, //fixme maybe DMG modification
            prevent: false
        };

        this.player.battle.emit('deal-damage', eventMessage);

        if (!eventMessage.prevent) {
            if (minionDetails.flags['shield']) {
                this.player.battle.addBattleAction({
                    name: 'damage',
                    to: this.id,
                    amount: 0
                });

                this.removeFlag('shield');

            } else {
                this.player.battle.addBattleAction({
                    name: 'damage',
                    to: this.id,
                    amount: dmg
                });

                const player = this.player;

                this._dealDamage(dmg);

                player.battle.emit('damage-dealt', eventMessage);
            }
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
        var healed = 0;

        if (amount && (this.hp !== this.maxHp || this.bufferHp !== this.bufferMaxHp)) {

            const mayHealHp = this.maxHp - this.hp;

            if (mayHealHp >= amount) {
                healed = amount;
                this.hp += amount;

            } else {
                healed = mayHealHp;
                this.hp += mayHealHp;

                const mayHealBufferHp = this.bufferMaxHp - this.bufferHp;

                const bufferHeal = Math.min(mayHealBufferHp, amount - mayHealHp);

                healed += bufferHeal;
                this.bufferHp += bufferHeal;
            }

            this.battle.emit('heal', { to: this });
        }

        this.player.battle.addBattleAction({
            to: this.id,
            name: 'heal',
            amount: healed
        });
    }

    addFlag(flag) {
        this.flags[flag] = true;

        if (flag === 'charge') {
            delete this.flags['sleep'];
        }
    }

    silence() {
        var base = this.base;

        for (var flag in this.flags) {
            if (!base.flags[flag] && !_.contains(SILENCE_IGNORE_FLAGS, flag)) {
                delete this.flags[flag];
            }
        }

        this.maxHp = base.maxHp;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }

        this.addFlag('silence');

        this.events = {};

        this._detachListeners();

        this.emit('silence');
    }

};

H.mixGameDataAccessors(H.Minion);
