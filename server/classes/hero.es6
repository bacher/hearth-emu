
const _ = require('lodash');
const H = require('../namespace');

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

        this.weapon = null;

        this.flags = {};

        this.player.battleEnterPromise.then(battle => {
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

    static create(heroName, player) {
        return new H[_.capitalize(heroName)](player);
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

                return true;
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

        this.battle.emit('use-hero-skill', {
            player: this.player
        });
    }

    wakeUp() {
        // FIXME UNUSED?
        delete this.flags['tired'];

        this.attack = 0;

        if (this.weapon) {
            this.weapon.onStartTurn();
        }
    }

    setHitFlags() {
        if (this.weapon) {
            this.weapon.setHitFlags();

        } else {
            // FIXME UNUSED?
            this.flags['tired'] = true;
        }
    }

    kill() {
        this.player.emit('message', { msg: 'defeat' });
    }

    addFlag(flag) {
        this.flags[flag] = true;
    }

    getBaseData() {
        return {
            that: this,
            id: this.id,
            attack: (this.weapon ? this.weapon.attack : 0) + this.attack,
            hp: this.hp,
            armor: this.armor,
            spellDamage: this.spellDamage,
            heroSkill: this.heroSkill.getClientData(),
            weapon: this.weapon ? this.weapon.getClientData() : null,
            flags: this.weapon ? _.extend({}, this.flags, this.weapon.getFlags()) : this.flags
        };
    }

    _modifyClientData(data) {
        if (this.player.active && data.attack > 0 && !data.flags['tired']) {
            data.flags['can-play'] = true;
        }
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

    is(flag) {
        return !!this.flags[flag];
    }
};

H.mixGameDataAccessors(H.Hero);
H.mixCustomEvents(H.Hero);
H.mixHitting(H.Hero);
