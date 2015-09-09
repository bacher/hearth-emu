
const _ = require('lodash');
const H = require('../namespace');

const Constructors = {
    [H.CLASSES.warrior]: 'Warrior',
    [H.CLASSES.shaman]: 'Shaman',
    [H.CLASSES.rogue]: 'Rogue',
    [H.CLASSES.hunter]: 'Hunter',
    [H.CLASSES.druid]: 'Druid',
    [H.CLASSES.warlock]: 'Warlock',
    [H.CLASSES.mage]: 'Mage',
    [H.CLASSES.priest]: 'Priest'
};

H.Hero = class Hero {
    constructor(player) {
        this.player = player;

        this.attack = 0;
        this.hp = 30;
        this.maxHp = 30;
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

            battle.on('start-turn', player => {
                if (player === this.player) {
                    this._onTurnStart();
                }
            });

            battle.on('end-turn', player => {
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

    setHeroSkill(activation, params, targets) {
        this.heroSkill = new H.Command({
            name: activation,
            params: params || [],
            targetsType: targets
        });
    }

    useHeroSkill(o) {
        this.heroSkill.act(o);
    }

    wakeUp() {
        delete this.flags['tired'];

        this.attack = 0;

        if (this.weapon) {
            this.weapon.wakeUp();
        }
    }

    setHitFlags() {
        if (this.weapon) {
            this.weapon.setHitFlags();

            if (!this.weapon) {
                this.flags['tired'] = true;
            }
        } else {
            this.flags['tired'] = true;
        }
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

    getData() {
        return this.getBaseData();
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
            isHeroSkillTargeting: this.heroSkill.skillNeedTarget,
            weapon: this.weapon ? this.weapon.getClientData() : null,
            flags: this.weapon ? _.extend({}, this.flags, this.weapon.getFlags()) : this.flags
        };
    }

    getClientData() {
        return this.player.battle.auras.applyEffect(this.player, 'hero', this.getBaseData());
    }

    canUseSkill() {
        return !this.skillUsed && this.mana >= 2;
    }

    addOverload(count) {
        this.nextOverload += count;
    }

    equipWeapon(weapon) {
        this.weapon = weapon;

        this.weapon.enterInGame(this.player);
    }

    _onTurnStart() {
        this.overload = this.nextOverload;
        this.nextOverload = 0;

        this.addCrystal();
        this.restoreMana();

        this.skillUsed = false;
    }

    _onTurnEnd() {

    }
};
