
const H = require('../namespace');

H.Card = class Card {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.type = info.type;
        this.cost = info.cost;
        this.clas = info.clas || 0;
        this.rarity = info.rarity || 0;
        this.pic = info.pic;
        this.flags = {};

        if (info.target && info.target !== 'none') {
            this.getTargets = H.TARGETS[info.target];
        }

        this.act = H.ACTIVATIONS[info.act];
        this.minion = info.minion || null;
        this.param = info.param || null;

        if (info.flags.uncollectable) {
            this.flags.uncollectable = true;
        }
    }
};
