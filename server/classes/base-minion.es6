
const Minion = require('./minion');

module.exports = class BaseMinion {
    constructor(info) {
        this.attack = info.attack;
        this.maxHp = info.maxHp;

        this.abilities = info.abilities || null;
    }

    spawn() {
        return new Minion({
            base: this
        });
    }
};
