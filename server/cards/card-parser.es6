
const fs = require('fs');
const H = require('../common');

// ############

const minionsLines = fs.readFileSync('minions.txt').toString().split('\n');

const minions = [];

var id = 0;

minionsLines.forEach(line => {
    line = line.trimRight();

    if (line && !/^#/.test(line)) {

        //Chillwind Yeti,minion,147/652/31,4,n,(4/4)
        const info = {};

        const bracket = line.indexOf('(');

        var headerPart = line.substr(0, bracket - 1);
        var minionPart = line.substr(bracket + 1);
        minionPart = minionPart.substr(0, minionPart.length - 1);

        const header = headerPart.split(',');
        const minion = minionPart.split(',');

        console.log(header, minion);

        id++;
        info.id = 'm' + id;
        info.type = H.CARD_TYPES.minion;
        info.name = header[0];
        info.pic = header[1];
        info.cost = Number(header[2]);
        info.clas = H.CLASSES_M[header[3]];
        info.act = 'summon';
        info.flags = {};

        info.minion = {
            attack: Number(minion[0].split('/')[0]),
            maxHp: Number(minion[0].split('/')[1]),
            flags: {}
        };

        minions.push(info);
    }
});

fs.writeFileSync('minions.json', JSON.stringify(minions));

// #####################

const spellsLines = fs.readFileSync('spells.txt').toString().split('\n');

const spells = [];

id = 0;

spellsLines.forEach(line => {
    line = line.trimRight();

    if (line && !/^#/.test(line)) {

        // Feral Spirit,148/136/214,3,s,[spawnCreatures:{feral_spirit,2}]
        const rx = /^([^,]+),([^,]+),(\d),([a-z]{1,2}),\[([^\]]+)\](?:,\{([^}]+)\})?/;
        const info = {};

        const details = line.match(rx);
        if (!details) {
            console.log(line);
            throw 1;
        }

        id++;
        info.id = 's' + id;
        info.type = H.CARD_TYPES.spell;
        info.name = details[1];
        info.pic = details[2];
        info.cost = Number(details[3]);
        info.clas = H.CLASSES_M[details[4]];
        info.flags = {};

        [info.act, info.param] = details[5].split(':');

        if (details[6]) {
            details[6].split(',').forEach(flag => {
                info.flags[flag] = true;
            });
        }

        spells.push(info);
    }
});

fs.writeFileSync('spells.json', JSON.stringify(spells));
