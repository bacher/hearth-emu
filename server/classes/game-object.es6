
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const H = require('../namespace');


H.GameObject = class GameObject extends EventEmitter {
    constructor() {
        super();
    }

    enterInGame(player) {
        this.player = player;

        for (var eventTypeName in this.base.events) {
            const eventActs = this.base.events[eventTypeName];

            if (eventTypeName === 'aura') {
                const aura = new H.Aura(player, eventActs);

                this.player.battle.auras.addAura(this, aura);
            }

            if (eventTypeName === 'end-turn') {
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

            if (eventTypeName === 'custom') {
                eventActs.forEach(command => {
                    const event = command.event;

                    this._onBattle(event.name, H.Events[event.name](player, event.params, () => {
                        command.act({
                            battle: this.player.battle,
                            player,
                            handCard: null,
                            params: null,
                            globalTargets: null
                        });
                    }));
                });
            }
        }
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

    setHitFlags() {
        if (this.flags['hit']) {
            this.flags['second-hit'] = true;
        } else {
            this.flags['hit'] = true;
        }
    }

    _onBattle(eventName, method) {
        this._listeners = this._listeners || [];

        method = method.bind(this);
        this._listeners.push({
            eventName,
            method
        });
        this.player.battle.on(eventName, method);
    }

    _detachListeners() {
        if (this._listeners) {
            this._listeners.forEach(info => {
                this.player.battle.removeListener(info.eventName, info.method);
            });
            this._listeners.length = 0;
        }
    }

    wakeUp() {
        delete this.flags['sleep'];
        delete this.flags['hit'];
        delete this.flags['second-hit'];
    }

    onEndTurn() {
        delete this.flags['freeze'];
        delete this.flags['sleep'];
    }

    detach() {
        this._detachListeners();

        this.emit('detach', this);

        this.player = null;
    }

    kill() {
        this._detachListeners();

        this.emit('death', this);

        //TODO: Deathrattle
    }

    is(prop) {
        return !!this.flags[prop];
    }
};
