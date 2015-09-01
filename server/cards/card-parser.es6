#!/usr/local/bin/node

const fs = require('fs');
const H = require('../namespace');
require('../constants');

// ############

const minionsLines = fs.readFileSync('minions.txt').toString().split('\n');

const minions = [];

var id = 0;

minionsLines.forEach(line => {
    line = line.trimRight();

    if (line && !/^#/.test(line)) {

        //Chillwind Yeti,minion,147/652/31,4,n,(4/4,{taunt}),{uncollectable}
        const info = {};
        const rx = /^([^(]+),\(([^)]+)\)(?:,\{([^}]+)\})?$/;
        const curves = /^\{(.*)\}$/;

        const match = line.match(rx);

        const headerPart = match[1];
        const minionPart = match[2];
        const flagsPart = match[3];

        const header = headerPart.split(',');
        const minion = minionPart.split(',');
        var minionFlags;

        if (minion[1]) {
            minionFlags = minion[1].match(curves)[1].split(',');
            minion.length = 1;
        }
        const flags = flagsPart && flagsPart.split(',');

        console.log(header, flags, minion, minionFlags);

        id++;
        info.id = 'm' + id;
        info.type = H.CARD_TYPES.minion;
        info.name = header[0];
        info.pic = header[1];
        info.cost = Number(header[2]);
        info.clas = H.CLASSES_M[header[3]];
        info.flags = flags;

        const attackHp = minion[0].split('/');

        info.minion = {
            attack: Number(attackHp[0]),
            maxHp: Number(attackHp[1]),
            flags: minionFlags || null
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

        // Feral Spirit,148/136/214,3,s,all[spawnCreatures:{feral_spirit,2}]
        // Lightning Bolt,148/115/10,1,s,all,[dealDamage:3,overload:1]
        const rx = /^([^,]+),([^,]+),(\d),([a-z]{1,2}),([a-z-]+),\[([^\]]+)\](?:,\{([^}]+)\})?/;
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

        info.target = details[5];

        info.acts = details[6].split(',').map(act => {
            var actName, param = '';
            [actName, param] = act.split(':');

            if (param && param.indexOf('{') === 0) {
                param = param.substr(1, param.length - 2).split(',');
            }

            return {
                actName,
                param
            };
        });

        if (details[7]) {
            info.flags = details[7].split(',');
        }

        spells.push(info);
    }
});

fs.writeFileSync('spells.json', JSON.stringify(spells));
