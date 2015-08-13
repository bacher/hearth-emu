
const Minion = require('./minion');

module.exports = class BaseMinion {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.attack = info.attack;
        this.maxHp = info.maxHp;

        this.abilities = info.abilities || {};
    }

    spawn() {
        return new Minion({
            base: this
        });
    }
};
