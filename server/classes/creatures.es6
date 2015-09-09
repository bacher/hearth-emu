
const _ = require('lodash');

const H = require('../namespace');

const MAX_MINIONS_COUNT = 7;


H.Creatures = class Creatures {
    constructor(player) {
        this.player = player;
        this.creatures = [];

        this._onCreatureDeath = this._onCreatureDeath.bind(this);
        this._onCreatureDetach = this._onCreatureDetach.bind(this);
    }

    canAddCreature() {
        return this.creatures.length !== MAX_MINIONS_COUNT;
    }

    addCreature(minion) {
        if (this.canAddCreature()) {
            this.creatures.push(minion);

            minion.enterInGame(this.player);

            minion.on('death', this._onCreatureDeath);
            minion.on('detach', this._onCreatureDetach);
        }
    }

    getCount() {
        return this.creatures.length;
    }

    getGameData() {
        return this.creatures.map(creat => creat.getGameData());
    }

    wakeUpAll() {
        this.creatures.forEach(creature => creature.wakeUp());
    }

    onEndTurn() {
        this.creatures.forEach(creature => creature.onEndTurn());
    }

    resetFlag(flag) {
        this.creatures.forEach(creature => {
            delete creature[flag];
        });
    }

    getCreatureIndex(creature) {
        return this.creatures.indexOf(creature);
    }

    getCreatureByCrid(crid) {
        const index = _.findIndex(this.creatures, { id: crid });

        return this.creatures[index];
    }

    hasCardCreature(card) {
        return this.creatures.some(creat => creat.card === card);
    }

    getAll() {
        return this.creatures;
    }

    getAllIds() {
        return this.creatures.map(minion => minion.id);
    }

    getAllByRace(race) {
        return this.creatures.filter(creature => creature.race === race);
    }

    getTauntMinions() {
        return this.creatures.filter(creature => creature.is('taunt'));
    }

    _removeCreature(creat) {
        const index = this.getCreatureIndex(creat);
        this.creatures.splice(index, 1);

        creat.removeListener('death', this._onCreatureDeath);
        creat.removeListener('detach', this._onCreatureDetach);
    }

    _onCreatureDetach(creat) {
        this._removeCreature(creat);
    }

    _onCreatureDeath(creat) {
        this._removeCreature(creat);
    }
};
