
const _ = require('lodash');

const MAX_MINIONS_COUNT = 7;

module.exports = class Creatures {
    constructor() {
        this.creatures = [];
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
        return this.creatures.filter(cr => !cr.flags.dead);
    }

    wakeUpAll() {
        this.creatures.forEach(creature => {
            delete creature.flags.sleep;
        });
    }

    getCreatureIndex(creature) {
        return this.creatures.indexOf(creature);
    }

    getCreatureByCrid(crid) {

        const index = _.findIndex(this.creatures, { crid: crid });

        return this.creatures[index];
    }

    isHasCardCreature(card) {
        return this.creatures.some(creat => creat.card === card);
    }
};
