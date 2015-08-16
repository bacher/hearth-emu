
module.exports = class Hero {
    constructor() {
        this.hp = 30;
        this.armor = 0;
        this.manaCount = 0;
        this.crystalCount = 0;
        this.skillUsed = false;
    }

    getManaStatus() {
        return {
            mana: this.manaCount,
            crystals: this.crystalCount
        };
    }

    addMana(count) {
        this.manaCount += count;
    }

    addCrystal() {
        this.crystalCount++;
    }

    restoreMana() {
        this.manaCount = this.crystalCount;
    }

    removeMana(count) {
        if (count > this.manaCount) {
            this.manaCount = 0;
        } else {
            this.manaCount -= count;
        }
    }

    getGameData() {
        return {
            hp: this.hp,
            armor: this.armor,
            mana: this.manaCount,
            crystals: this.crystalCount,
            skillUsed: this.skillUsed
        };
    }
};
