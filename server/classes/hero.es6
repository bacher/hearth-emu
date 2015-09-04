
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
        this.overload = 0;
        this.nextOverload = 0;

        this.skillUsed = false;
        this.id = 'hero';

        this.flags = {};

        this.player.on('battle-enter', battle => {
            this.battle = battle;

            battle.on('turn-start', player => {
                if (player === this.player) {
                    this._onTurnStart();
                }
            });
        });
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
        this.mana = this.crystals - this.overload;
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
            overload: this.overload,
            nextOverload: this.nextOverload,
            crystals: this.crystals,
            skillUsed: this.skillUsed,
            canUseSkill: this.canUseSkill(),
            isHeroSkillTargeting: !!this.heroSkill.targetsType,
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

    addOverload(count) {
        this.nextOverload += count;
    }

    _onTurnStart() {
        this.overload = this.nextOverload;
        this.nextOverload = 0;

        this.addCrystal();
        this.restoreMana();

        this.skillUsed = false;
    }

    useSkill() {
        this.mana -= 2;
        this.skillUsed = true;

        this._useSkill();
    }
};
