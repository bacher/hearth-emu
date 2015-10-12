
const H = require('../namespace');

H.Energy = class Energy {
    constructor() {
        this.objType = 'energy';

        this.mana = 0;
        this.crystals = 0;
        this.overload = 0;
        this.nextOverload = 0;
    }

    getManaStatus() {
        return {
            mana: this.mana,
            crystals: this.crystals
        };
    }

    addMana(count) {
        this.mana += count;

        if (this.mana > 10) {
            this.mana = 10;
        }
    }

    addCrystal() {
        if (this.crystals < 10) {
            this.crystals++;
        }
    }

    removeCrystal(count = 1) {
        this.crystals = Math.max(0, this.crystals - count);
    }

    restoreMana() {
        this.mana = this.crystals - this.overload;
    }

    removeMana(count) {
        if (count > this.mana) {
            this.mana = 0;
        } else {
            this.mana -= count;
        }
    }

    addOverload(count) {
        this.nextOverload += count;
    }

    removeOverload() {
        this.nextOverload = 0;
    }

    getBaseData() {
        return {
            mana: this.mana,
            overload: this.overload,
            nextOverload: this.nextOverload,
            crystals: this.crystals
        };
    }

};

H.mixGameDataAccessors(H.Energy);
