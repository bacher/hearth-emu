
const H = require('../common');
const Cards = require('../cards');
const Minion = require('./minion');

module.exports = class Hero {
    constructor(clas) {
        this.clas = clas;
        this.hp = 30;
        this.armor = 0;
        this.manaCount = 0;
        this.crystalCount = 0;
        this.skillUsed = false;

        if (clas === H.CLASSES.shaman) {
            this.totems = [
                Cards.findByName('Searing Totem'),
                Cards.findByName('Stoneclaw Totem'),
                Cards.findByName('Wrath of Air Totem'),
                Cards.findByName('Healing Totem')
            ];
        }
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

    useSkill(battle, i, op, data) {
        this.manaCount -= 2;
        this.skillUsed = true;

        switch (this.clas) {
            case H.CLASSES.shaman:
                const totemsLeft = this.totems.filter(totem => !i.creatures.isHasCardCreature(totem));

                if (totemsLeft.length) {
                    const totem = totemsLeft[Math.floor(Math.random() * totemsLeft.length)];

                    i.creatures.addCreature(new Minion(totem));
                }
                break;
            default:
                console.log('NOT IMPLEMENTED');
        }
    }
};
