
module.exports = class Card {
    constructor(info) {
        this.name = info.name;
        this.type = info.type;
        this.cost = info.cost;
        this.rarity = info.rarity || 0;
        this.act = info.act;
        this.param = info.param;
    }
};
