
const _ = require('lodash');
const H = require('../namespace');


H.Weapon = class Weapon extends H.GameObject {

    constructor(card) {
        super();

        this.card = card;
        this.base = card.weapon;

        this.attack = this.base.attack;
        this.durability = this.base.durability;
        this.flags = _.clone(this.base.flags);
    }

    getClientData() {
        return {
            attack: this.attack,
            durability: this.durability
        };
    }

    setHitFlags() {
        H.GameObject.prototype.setHitFlags.apply(this);

        this.durability--;

        if (this.durability === 0) {
            this.kill();

            this.player.hero.weapon = null;
        }
    }
};
