
const _ = require('lodash');
const H = require('../namespace');


H.Trap = class Trap extends H.GameObject {

    constructor(handCard, card) {
        super(handCard, card);

        this.id = _.uniqueId('trap');

        this.base = this.card.trap;

        this.flags = {};
    }

    getClientData() {
        return {
            pic: this.card.pic
        };
    }
};
