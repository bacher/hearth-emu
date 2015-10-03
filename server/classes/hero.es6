
const _ = require('lodash');
const H = require('../namespace');

const Constructors = {
    [H.CLASSES.warrior]: 'Warrior',
    [H.CLASSES.shaman]: 'Shaman',
    [H.CLASSES.rogue]: 'Rogue',
    [H.CLASSES.paladin]: 'Paladin',
    [H.CLASSES.hunter]: 'Hunter',
    [H.CLASSES.druid]: 'Druid',
    [H.CLASSES.warlock]: 'Warlock',
    [H.CLASSES.mage]: 'Mage',
    [H.CLASSES.priest]: 'Priest'
};

H.Hero = class Hero {
    constructor(player) {
        this.player = player;

        this.id = _.uniqueId('hero');
        this.objType = 'hero';

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

    dealDamage(dmg) {
        if (!this.flags['immune']) {

            dmg = H.parseValue(dmg);

            this.player.battle.emit('deal-damage', {
                by: null,
                to: this,
                dmg: dmg,
                willDie: this.armor + this.hp <= dmg
            });

            if (!this.flags['immune']) {
                this.armor -= dmg;

                if (this.armor < 0) {
                    this.hp += this.armor;
                    this.armor = 0;
                }

                this.player.battle.addBattleAction({
                    name: 'damage',
                    to: this.id,
                    amount: dmg
                });

                if (this.hp <= 0) {
                    this.hp = 0;

                    this.kill();
                }
            }
        }
    }

    heal() {
        H.Minion.prototype.heal.apply(this, arguments);
    }

    setHeroSkill(options) {
        this.heroSkill = new H.HeroSkill(this, options);
    }

    useHeroSkill(o) {
        this.heroSkill.use(o);
    }

    wakeUp() {
        delete this.flags['tired'];

        this.attack = 0;

        if (this.weapon) {
            this.weapon.onStartTurn();
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
        this.player.emit('message', { msg: 'defeat' });
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

    addFlag(flag) {
        this.flags[flag] = true;
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
            that: this,
            id: this.id,
            attack: (this.weapon ? this.weapon.attack : 0) + this.attack,
            hp: this.hp,
            armor: this.armor,
            spellDamage: this.spellDamage,
            mana: this.mana,
            overload: this.overload,
            nextOverload: this.nextOverload,
            crystals: this.crystals,
            skillUsed: this.heroSkill.isUsed(),
            canUseSkill: this.heroSkill.canUseSkill(),
            isHeroSkillTargeting: this.heroSkill.isNeedTarget(),
            weapon: this.weapon ? this.weapon.getClientData() : null,
            flags: this.weapon ? _.extend({}, this.flags, this.weapon.getFlags()) : this.flags
        };
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

        this.heroSkill.charge();
    }

    _onTurnEnd() {

    }

    _onCustomEvent(command, eventMessage, globalTargets) {
        command.act({
            battle: this.player.battle,
            player: this.player,
            handCard: null,
            params: null,
            globalTargets,
            eventMessage
        });
    }
};

H.mixGameDataAccessors(H.Hero);
H.mixCustomEvents(H.Hero);
