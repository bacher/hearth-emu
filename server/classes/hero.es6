
const H = require('../namespace');

const Constructors = {
    [H.CLASSES.warrior]: 'Warrior',
    [H.CLASSES.shaman]: 'Shaman',
    [H.CLASSES.rogue]: 'Rogue',
    [H.CLASSES.druid]: 'Druid',
    [H.CLASSES.priest]: 'Priest',
    [H.CLASSES.hunter]: 'Hunter'
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

        this.weapon = null;

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

            battle.on('turn-end', player => {
                if (player === this.player) {
                    this._onTurnEnd();
                }
            });
        });
    }

    static create(player, clas) {
        return new H[Constructors[clas]](player);
    }

    dealDamage() {
        H.Minion.prototype.dealDamage.apply(this, arguments);
    }

    heal() {
        H.Minion.prototype.heal.apply(this, arguments);
    }

    kill() {
        this.player.emit('message', { msg: 'death' });
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
            attack: (this.weapon ? this.weapon.attack : 0) + this.attack,
            hp: this.hp,
            armor: this.armor,
            spellDamage: this.spellDamage,
            mana: this.mana,
            overload: this.overload,
            nextOverload: this.nextOverload,
            crystals: this.crystals,
            skillUsed: this.skillUsed,
            canUseSkill: this.canUseSkill(),
            isHeroSkillTargeting: !!this.heroSkill.skillTargetsType,
            weapon: this.weapon,
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

    _onTurnEnd() {
        this.attack = 0;
    }
};
