
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const H = require('../namespace');


H.GameObject = class GameObject extends EventEmitter {
    constructor(handCard, card) {
        super();

        this.handCard = handCard;

        if (this.handCard) {
            this.card = this.handCard.base;
        } else {
            this.card = card;
        }
    }

    enterInGame(player) {
        this.battle = player.battle;
        this.player = player;

        delete this.flags['dead'];
        delete this.flags['detached'];

        for (var eventTypeName in this.base.events) {
            const eventActs = this.base.events[eventTypeName];

            if (eventTypeName === 'aura') {
                eventActs.forEach(aura => {
                    H.Aura.addAura(player, this, aura);
                });
            }

            // FIXME что с этим делать?
            if (eventTypeName === 'end-turn') {
                this._onBattle('end-turn', eventPlayer => {
                    if (player === eventPlayer) {
                        eventActs.act({
                            battle: player.battle,
                            player,
                            handCard: null,
                            params: null,
                            globalTargets: null
                        });
                    }
                });
            }

            if (eventTypeName === 'custom') {
                eventActs.forEach(command => this.addCustomEvent(command));
            }
        }
    }

    getFlags() {
        const flags = _.clone(this.flags);

        return this._processFlags(flags);
    }

    _modifyData(data) {
        data.flags = this._processFlags(data.flags);
    }

    _processFlags(flags) {
        delete flags['tired'];

        if (flags['freeze'] || flags['sleep'] || flags['cant-attack']) {
            flags['tired'] = true;

        } else if (flags['hit']) {
            if (flags['windfury']) {
                if (flags['second-hit']) {
                    flags['tired'] = true;
                }
            } else {
                flags['tired'] = true;
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

        delete this.flags['stealth'];
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
        if (!this.flags['detached']) {
            this._detachListeners();

            this.flags['detached'] = true;

            this.emit('detach', this);

            this.player = null;
        }
    }

    kill() {
        if (!this.flags['dead']) {
            this.player.battle.emit('death', this);

            this.detach();

            this.flags['dead'] = true;

            this.emit('death', this);

            //TODO: Deathrattle
        }
    }

    is(prop) {
        return !!this.flags[prop];
    }

    _onCustomEvent(command, eventMessage, globalTargets) {
        command.act({
            battle: this.battle,
            player: this.player,
            handCard: null,
            minion: this,
            params: null,
            globalTargets,
            eventMessage
        });

        if (this.card.type === H.CARD_TYPES['trap']) {
            this.battle.emit('play-secret', this.player);

            this.battle.addBattleAction({
                name: 'play-secret',
                pic: this.card.pic
            });

            this.detach();
        }
    }
};

H.mixCustomEvents(H.GameObject);
