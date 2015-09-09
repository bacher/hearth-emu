
const _ = require('lodash');
const H = require('../namespace');

H.Card = class Card {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.type = info.type;
        this.cost = info.cost;
        this.clas = info.clas;
        this.pic = info.pic;
        this.flags = parseFlags(info.flags);
        this.targetsType = info.targetsType;

        if (info.type === H.CARD_TYPES.spell) {
            this.acts = new H.Acts(info.spell.acts);

        } else if (info.type === H.CARD_TYPES.minion || info.type === H.CARD_TYPES.weapon) {
            this.acts = new H.Acts();
            var activation;
            var object;

            if (info.type === H.CARD_TYPES.minion) {
                activation = 'card-summon';
                this.minion = object = info.minion;

            } else {
                activation = 'equip-weapon';
                this.weapon = object = info.weapon;
            }

            if (!object) {
                console.log(info.name);
            }
            object.flags = parseFlags(object.flags);

            this.acts.addCommand({
                name: activation,
                params: [this.id],
                targetsType: 'not-need'
            });

            for (var eventTypeName in object.events) {
                const commands = object.events[eventTypeName];

                if (eventTypeName === 'battlecry') {
                    this.acts.addCommands(commands);
                } else if (_.contains(['deathrattle', 'end-turn', 'start-turn'], eventTypeName)) {
                    object.events[eventTypeName] = new H.Acts(commands);
                }
            }

            if (this.targetsType) {
                this.flags['need-battlecry-target'] = true;
            }
        }
    }
};

function parseFlags(flags) {
    const flagsHash = {};

    if (flags) {
        flags.forEach(flag => {
            flagsHash[flag] = true;
        });
    }

    return flagsHash;
}
