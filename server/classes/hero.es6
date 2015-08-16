
const H = require('../common');
const Minion = require('./minion');

module.exports = class Hero {
    constructor(player, clas) {
        this.player = player;
        this.battle = player.battle;

        this.clas = clas;
        this.hp = 30;
        this.armor = 0;
        this.spellDamage = 0;
        this.mana = 0;
        this.crystals = 0;
        this.skillUsed = false;

        if (clas === H.CLASSES.shaman) {
            const Cards = require('../cards');

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
            mana: this.mana,
            crystals: this.crystals
        };
    }

    addMana(count) {
        this.mana += count;
    }

    addCrystal() {
        this.crystals++;
    }

    restoreMana() {
        this.mana = this.crystals;
    }

    removeMana(count) {
        if (count > this.mana) {
            this.mana = 0;
        } else {
            this.mana -= count;
        }
    }

    getBaseData() {
        return {
            hp: this.hp,
            armor: this.armor,
            spellDamage: this.spellDamage,
            mana: this.mana,
            crystals: this.crystals,
            skillUsed: this.skillUsed
        };
    }

    getData() {
        return this.battle.auras.applyEffect(this);
    }

    getClientData() {
        return this.getData();
    }

    useSkill(battle, i, op, data) {
        this.mana -= 2;
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
