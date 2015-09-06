
const H = require('../namespace');

H.Card = class Card {
    constructor(info) {
        this.id = info.id;
        this.name = info.name;
        this.type = info.type;
        this.cost = info.cost;
        this.clas = info.clas || 0;
        this.rarity = info.rarity || 0;
        this.pic = info.pic;
        this.flags = {};

        if (info.flags) {
            info.flags.forEach(flag => {
                this.flags[flag] = true;
            });
        }

        this.targetsType = info.targetsType;

        if (info.type === H.CARD_TYPES.spell) {
            this.acts = info.acts;

            this.acts.forEach(act => {
                act.actFunc = H.ACTIVATIONS[act.name];

                if (!act.actFunc) {
                    console.warn('Activation not founded "%s".', act.name);
                    throw 0;
                }
            });

        } else if (info.type === H.CARD_TYPES.minion) {
            this.acts = [{
                actFunc: H.ACTIVATIONS['card-summon'],
                targetsType: 'not-need',
                params: [this.id]
            }];

            const battlecry = info.minion.events['battlecry'];
            if (battlecry) {
                battlecry.actFunc = H.ACTIVATIONS[battlecry.name];

                if (!battlecry.actFunc) {
                    console.warn('Activation not founded "%s".', battlecry.name);
                    throw 0;
                }

                this.acts.push(battlecry);
            }

            this.minion = info.minion;

            if (this.minion.flags) {
                const flagsArray = this.minion.flags;

                this.minion.flags = {};

                flagsArray.forEach(flag => {
                    this.minion.flags[flag] = true;
                });
            } else {
                this.minion.flags = {};
            }

            if (this.targetsType) {
                this.flags['need-battlecry-target'] = true;
            }
        }

    }
};
