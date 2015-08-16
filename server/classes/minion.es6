
const _ = require('lodash');

module.exports = class Minion {
    constructor(card) {
        this.id = _.uniqueId('minion');

        this.card = card;
        this.base = card.minion;
        this.attack = this.base.attack;
        this.maxHp = this.base.maxHp;
        this.flags = _.clone(this.base.flags);

        if (!this.base.flags.charge) {
            this.flags.sleep = true;
        }
    }
};
