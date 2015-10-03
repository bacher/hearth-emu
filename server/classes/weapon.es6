
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

    reduceDurability(count) {
        this.durability -= count;

        if (this.durability <= 0) {
            this.destroy();
        }
    }

    setHitFlags() {
        H.GameObject.prototype.setHitFlags.apply(this);

        if (this.card.name === 'Gorehowl') {
            this.attack--;

            if (this.attack === 0) {
                this.destroy();
            }
        } else {
            this.reduceDurability(1);
        }
    }

    destroy() {
        const player = this.player;

        this.kill();

        player.hero.weapon = null;
    }
};
