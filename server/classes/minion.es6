
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const H = require('../namespace');


H.Minion = class Minion extends EventEmitter {
    constructor(handCard, card) {
        super();

        this.id = _.uniqueId('minion');

        if (handCard) {
            this.handCard = handCard;
            this.card = handCard.base;
        } else {
            this.card = card;
        }

        this.base = this.card.minion;
        this.attack = this.base.attack;
        this.hp = this.base.maxHp;
        this.maxHp = this.base.maxHp;
        this.flags = _.clone(this.base.flags);
        this.race = this.base.race;
        this.events = {};

        this._listeners = [];

        if (!this.base.flags['charge']) {
            this.flags['sleep'] = true;
        }
    }

    static createByName(name) {
        return new H.Minion(null, H.CARDS.getByName(name, H.CARD_TYPES.minion));
    }

    getGameData() {
        return {
            id: this.id,
            card: this.card,
            base: this.base,
            attack: this.attack,
            hp: this.hp,
            maxHp: this.maxHp,
            flags: this.getFlags()
        };
    }

    getData() {
        return this.player.battle.auras.applyEffect(this.player, 'minions', this.getBaseData());
    }

    getBaseData() {
        const data = {};
        ['id', 'card', 'base', 'attack', 'hp', 'maxHp', 'flags', 'race'].forEach(prop => {
            data[prop] = this[prop];
        });
        data.that = this;
        return data;
    }

    _onBattle(eventName, method) {
        method = method.bind(this);
        this._listeners.push({
            eventName,
            method
        });
        this.player.battle.on(eventName, method);
    }

    enterInGame(player) {
        this.player = player;

        for (var eventName in this.base.events) {
            const eventActs = this.base.events[eventName];

            if (eventName === 'aura') {
                const aura = new H.Aura(player, eventActs);

                this.player.battle.auras.addAura(this, aura);
            }

            if (eventName === 'end-turn') {
                this._onBattle('end-turn', eventPlayer => {
                    if (player === eventPlayer) {
                        eventActs.act({
                            battle: player.battle,
                            player,
                            handCard: null,
                            data: null,
                            globalTargets: null
                        });
                    }
                });
            }

            if (eventName === 'custom') {
                eventActs.forEach(eventInfo => {
                    this._onBattle(eventInfo.eventName, () => {
                        eventInfo.actFunc({
                            params: arguments,
                            player,
                            targets: eventInfo.targetsType && H.TARGETS.getByTargetsType(player, eventInfo.targetsType, this.handCard) || []
                        });
                    });
                });
            }
        }
    }

    leaveGame() {
        this._listeners.forEach(info => {
            this.player.battle.removeListener(info.eventName, info.method);
        });
        this._listeners.length = 0;
    }

    wakeUp() {
        delete this.flags['sleep'];
        delete this.flags['hit'];
        delete this.flags['second-hit'];
    }

    setHitFlags() {
        if (this.flags['hit']) {
            this.flags['second-hit'] = true;
        } else {
            this.flags['hit'] = true;
        }
    }

    dealDamage(dmg) {
        if (/\d+-\d+/.test(dmg)) {
            const dmgRandom = dmg.split('-').map(Number);

            dmg = dmgRandom[0] + Math.floor(Math.random() * (dmgRandom[1] - dmgRandom[0]));
        }

        this.hp -= dmg;

        if (this.hp <= 0) {
            this.hp = 0;

            this.kill();
        }
    }

    heal(amount) {
        this.hp += amount;
        if (this.hp > this.maxHp) {
            this.hp = this.maxHp;
        }
    }

    addFlag(flag) {
        this.flags[flag] = true;
    }

    getFlags() {
        const flags = _.clone(this.flags);

        if (flags['freeze']) {
            flags['tired'] = true;
        } else {
            if (flags['hit']) {
                if (flags['windfury']) {
                    if (flags['second-hit']) {
                        flags['tired'] = true;
                    }
                } else {
                    flags['tired'] = true;
                }
            }
        }

        return flags;
    }

    detach() {
        this.leaveGame();

        this.emit('detach', this);

        this.player = null;
    }

    kill() {
        this.leaveGame();

        this.emit('death', this);
    }

    is(prop) {
        return !!this.flags[prop];
    }
};
