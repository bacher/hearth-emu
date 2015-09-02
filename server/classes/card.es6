
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
        this.target = 'not-need';
        this.flags = {};

        if (info.flags) {
            info.flags.forEach(flag => {
                this.flags[flag] = true;
            });
        }

        if (info.type === H.CARD_TYPES.spell) {
            this.target = info.target;

            if (this.target !== 'not-need') {
                this.getTargets = H.TARGETS[info.target];
            }

            this.acts = info.acts.map(act => {
                return {
                    act: H.ACTIVATIONS[act.actName],
                    param: act.param || null
                };
            });
        } else if (info.type === H.CARD_TYPES.minion) {
            this.acts = [{ act: H.ACTIVATIONS['summon']}];

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
        }

    }
};
