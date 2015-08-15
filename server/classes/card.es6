
const A = require('./activations');

module.exports = class Card {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.type = info.type;
        this.cost = info.cost;
        this.clas = info.clas || 0;
        this.rarity = info.rarity || 0;
        this.pic = info.pic;
        this.flags = {};

        this.act = A[info.act];
        this.minion = info.minion || null;
        this.param = info.param || null;

        if (info.flags.uncollectable) {
            this.flags.uncollectable = true;
        }
    }
};
