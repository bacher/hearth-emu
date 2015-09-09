
const _ = require('lodash');
const H = require('../namespace');


H.Minion = class Minion extends H.GameObject {
    constructor(handCard, card) {
        super();

        this.id = _.uniqueId('minion');

        if (handCard) {
            this.handCard = handCard;
            this.card = handCard.base;
        } else {
            this.card = card;
        }

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

    getGameData() {
        return {
            id: this.id,
            card: this.card,
            base: this.base,
            attack: this.attack,
            hp: this.hp,
            maxHp: this.maxHp,
            flags: this.getFlags()
        };
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

    dealDamage(dmg) {
        this.player.battle.emit('deal-damage', null, this);

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

};
