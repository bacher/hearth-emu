
const H = require('../namespace');

const Constructors = {
    [H.CLASSES.shaman]: 'Shaman',
    [H.CLASSES.druid]: 'Druid'
};

H.Hero = class Hero {
    constructor(player) {
        this.player = player;

        this.attack = 0;
        this.hp = 30;
        this.armor = 0;
        this.spellDamage = 0;
        this.mana = 0;
        this.crystals = 0;
        this.skillUsed = false;
        this.id = 'hero';

        this.flags = {};
    }

    static create(player, clas) {
        return new H[Constructors[clas]](player);
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
        if (this.crystals < 10) {
            this.crystals++;
        }
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
            attack: this.attack,
            hp: this.hp,
            armor: this.armor,
            spellDamage: this.spellDamage,
            mana: this.mana,
            crystals: this.crystals,
            skillUsed: this.skillUsed,
            canUseSkill: this.canUseSkill(),
            flags: this.flags
        };
    }

    getData() {
        return this.player.battle.auras.applyEffect(this);
    }

    getClientData() {
        return this.getData();
    }

    canUseSkill() {
        return !this.skillUsed && this.mana >= 2;
    }

    useSkill() {
        this.mana -= 2;
        this.skillUsed = true;

        this._useSkill();
    }
};
