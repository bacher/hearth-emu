
const _ = require('lodash');

const H = require('../namespace');


H.Traps = class Traps {
    constructor(player) {
        this.player = player;
        this.traps = [];

        this._onTrapDetach = this._onTrapDetach.bind(this);
    }

    addTrap(trap) {
        this.traps.push(trap);

        trap.enterInGame(this.player);

        trap.on('detach', this._onTrapDetach);
    }

    getClientData() {
        return this.traps.map(trap => trap.getClientData());
    }

    getTrapById(id) {
        return _.find(this.traps, { id: id });
    }

    hasCardTrap(card) {
        return this.traps.some(trap => trap.card === card);
    }

    getAll() {
        return this.traps;
    }

    //getAllIds() {
    //    return this.traps.map(trap => trap.id);
    //}

    _removeTrap(trap) {
        const index = this.traps.indexOf(trap);
        this.traps.splice(index, 1);

        trap.removeListener('detach', this._onTrapDetach);
    }

    _onTrapDetach(trap) {
        this._removeTrap(trap);
    }

};
