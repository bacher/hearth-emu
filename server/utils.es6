
const H = require('./namespace');


H.parseValue = function(value) {
    if (/\d+-\d+/.test(value)) {
        const dmgRandom = value.split('-').map(Number);

        value = dmgRandom[0] + Math.floor(Math.random() * (dmgRandom[1] - dmgRandom[0]));
    }

    return value;
};
