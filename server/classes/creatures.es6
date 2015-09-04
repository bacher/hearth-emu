
const _ = require('lodash');

const H = require('../namespace');

const MAX_MINIONS_COUNT = 7;


H.Creatures = class Creatures {
    constructor() {
        this.creatures = [];
        this.graveyard = [];
    }

    canAddCreature() {
        return this.creatures.length !== MAX_MINIONS_COUNT;
    }

    addCreature(minion) {
        if (this.canAddCreature()) {
            this.creatures.push(minion);
        }
    }

    getGameData() {
        return this.creatures;
    }

    wakeUpAll() {
        this.creatures.forEach(creature => {
            delete creature.flags['sleep'];

            if (!creature.flags['freeze']) {
                delete creature.flags['tired'];
            }
        });
    }

    resetOnEndTurnEffects() {
        this.creatures.forEach(creature => {
            creature['freeze'] = false;
        });
    }

    getCreatureIndex(creature) {
        return this.creatures.indexOf(creature);
    }

    getCreatureByCrid(crid) {
        const index = _.findIndex(this.creatures, { id: crid });

        return this.creatures[index];
    }

    isHasCardCreature(card) {
        return this.creatures.some(creat => creat.card === card);
    }

    getAll() {
        return this.creatures;
    }

    getAllIds() {
        return this.creatures.map(minion => minion.id);
    }

    getTauntMinions() {
        return this.creatures.filter(creature => creature.is('taunt'));
    }

    onCreatureDeath(creat) {
        const index = this.getCreatureIndex(creat);
        this.creatures.splice(index, 1);
        this.graveyard.push(creat);
    }
};
