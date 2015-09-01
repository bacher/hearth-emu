
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

        if (this.type === H.CARD_TYPES.spell) {
            this.target = info.target;
        } else {
            this.target = 'not-need';
        }

        this.flags = {};

        if (info.target && info.target !== 'none') {
            this.getTargets = H.TARGETS[info.target];
        }

        if (info.type === H.CARD_TYPES.spell) {
            this.acts = info.acts.map(act => {
                return {
                    act: H.ACTIVATIONS[act.actName],
                    param: act.param || null
                };
            });
        }

        this.minion = info.minion || null;

        if (info.flags.uncollectable) {
            this.flags.uncollectable = true;
        }
    }
};
