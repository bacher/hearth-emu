
const _ = require('lodash');

module.exports = class Minion {
    constructor(info) {
        this.base = info.base;
        this.attack = info.base.attack;
        this.maxHp = info.base.maxHp;
        this.flags = {};

        this.mid = _.uniqueId('m')
    }
};
