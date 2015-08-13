
const MAX_MINIONS_COUNT = 7;

module.exports = class Minions {
    constructor() {
        this.minions = [];
    }

    canAddMinions() {
        return this.minions.length !== MAX_MINIONS_COUNT;
    }

    addMinion(minion) {
        if (this.canAddMinions()) {
            this.minions.push(minion);
        }
    }

    getGameData() {
        return {
            minions: this.minions
        };
    }

    wakeUpAll() {
        this.minions.forEach(minion => {
            delete minion.flags.sleep;
        });
    }
};
