
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const H = require('../namespace');

H.HandCard = class HandCard extends EventEmitter {
    constructor(player, info) {
        super();

        this.player = player;

        this.objType = 'hand-card';

        this.id = _.uniqueId('hand');
        this.base = info;
    }

    getBaseData() {
        return {
            that: this,
            id: this.id,
            base: this.base,
            cost: this.base.cost
        };
    }

    _modifyClientData(data) {
        data.flags = {};
        data.flags['can-play'] = this.player.active && this.player.hero.mana >= data.cost;

        if (data.flags['can-play']) {
            data.flags['can-play'] = !this.base.conditions.some(condition => !H.Conditions.check(condition, this));
        }
    }
};

H.mixGameDataAccessors(H.HandCard);
