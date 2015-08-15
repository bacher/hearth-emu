
const fs = require('fs');
const H = require('../common');


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
        info.flags = {};

        info.minion = {
            attack: Number(minion[0].split('/')[0]),
            maxHp: Number(minion[0].split('/')[1])
        };

        minions.push(info);
    }
});

fs.writeFileSync('minions.json', JSON.stringify(minions));
