
const _ = require('lodash');
const H = require('../namespace');

H.HandCard = class HandCard {
    constructor(player, info) {
        this.player = player;
        Object.defineProperty(this, 'player', {
            enumerable: false
        });

        this.id = _.uniqueId('hand_');
        this.base = info;
    }
};
