
var BaseMinion = require('./classes/base-minion');

const minions = [
    new BaseMinion({
        id: 'chillwind_yeti',
        attack: 4,
        maxHp: 5
    })
];

const minionsHash = {};

for (var i = 0; i < minions.length; ++i) {
    var minion = minions[i];
    minionsHash[minion.id] = minion;
}


module.exports = minionsHash;
