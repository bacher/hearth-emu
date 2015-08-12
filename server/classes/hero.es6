
module.exports = class Hero {
    constructor() {
        this.hp = 30;
        this.armor = 0;
        this.manaCount = 0;
        this.crystalCount = 0;
    }

    getManaStatus() {
        return {
            mana: this.manaCount,
            crystals: this.crystalCount
        };
    }

    addCrystal() {
        this.crystalCount += 1;
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
            crystals: this.crystalCount
        };
    }
};
