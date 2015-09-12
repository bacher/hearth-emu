
const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;
const H = require('../namespace');

H.HandCard = class HandCard extends EventEmitter {
    constructor(player, info) {
        super();

        this.player = player;

        this.objType = 'hand-card';

        this.id = _.uniqueId('hand_');
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
};

H.mixGameDataAccessors(H.HandCard);
