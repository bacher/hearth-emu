
module.exports = class Card {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.type = info.type;
        this.cost = info.cost;
        this.rarity = info.rarity || 0;
        this.act = info.act;
        this.param = info.param;
        this.clas = info.clas || 0;
        this.uncollectable = info.uncollectable || false;
        this.pic = info.pic;
    }
};
