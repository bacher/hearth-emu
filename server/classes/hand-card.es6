
const _ = require('lodash');
const H = require('../namespace');

H.HandCard = class HandCard {
    constructor(info) {
        this.id = _.uniqueId('hand_');
        this.base = info;
    }
};



