
module.exports = class Card {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.type = info.type;
        this.cost = info.cost;
        this.clas = info.clas || 0;
        this.rarity = info.rarity || 0;
        this.act = info.act || null;
        this.param = info.param || null;
        this.pic = info.pic;
        this.flags = {};

        if (info.flags.uncollectable) {
            this.flags.uncollectable = true;
        }
    }
};
