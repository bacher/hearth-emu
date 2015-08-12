
module.exports = class Card {
    constructor(info) {
        this.type = info.type;
        this.cost = info.cost;
        this.activation = info.activation;
        this.param = info.param;
    }
};
